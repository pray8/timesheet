import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Card, InputNumber, Table, message, Tag, Select } from 'antd';
import moment from 'moment';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

const Timesheet = () => {
    const [currentWeek, setCurrentWeek] = useState(moment().startOf('week'));
    const [form] = Form.useForm();
    const [timesheetData, setTimesheetData] = useState([]);
    const [projects, setProjects] = useState([]);
    const [formState, setFormState] = useState({});
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const startOfWeek = currentWeek.clone().startOf('week');
    const endOfWeek = currentWeek.clone().endOf('week');
    const today = moment().endOf('day');
    const days = [];
    let day = startOfWeek.clone();
    while (day <= endOfWeek) {
        days.push(day.clone());
        day = day.add(1, 'day');
    }
    const goToPreviousWeek = () => setCurrentWeek(currentWeek.clone().subtract(1, 'week'));
    const goToNextWeek = () => setCurrentWeek(currentWeek.clone().add(1, 'week'));

    // Check if token exists
    const token = localStorage.getItem('token');
    const decoded = jwt.decode(token);
    const userId = decoded?.sub;

    // Redirect if no token or token is invalid
    useEffect(() => {
        if (!token || !decoded) {
            message.info('You do not have permission. Please log in.');
            navigate('/login'); // Redirect to login page
        }
    }, [token, decoded, navigate]);

    // Fetch projects for dropdown selection
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                let config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: `${process.env.REACT_APP_DNIO_SERVICES_BASE_URL}/${process.env.REACT_APP_DNIO_APP_NAME}/${process.env.REACT_APP_DNIO_SERVICE_PROJECTS}`,
                    headers: {
                        'accept': '*/*',
                        'Authorization': process.env.REACT_APP_DNIO_API_KEY
                    }
                };
                const response = await axios.request(config);
                setProjects(response.data);
            } catch (error) {
                message.error('Failed to fetch projects');
            }
        };
        fetchProjects();
    }, []);

    const fetchTimesheetData = async () => {
        setLoading(true);
        try {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${process.env.REACT_APP_DNIO_SERVICES_BASE_URL}/${process.env.REACT_APP_DNIO_APP_NAME}/${process.env.REACT_APP_DNIO_SERVICE_TIMESHEETS}/?filter={"$and":[{"date.rawData":{"$gte":"${startOfWeek.format('YYYY-MM-DD')}","$lte":"${endOfWeek.format('YYYY-MM-DD')}"}}, {"userId._id": "${userId}"}]}`,
                headers: {
                    'accept': '*/*',
                    'Authorization': process.env.REACT_APP_DNIO_API_KEY
                }
            };
            const response = await axios.request(config);
            setTimesheetData(response.data);
            message.success('Timesheet Fetched Successfully!');
        } catch (error) {
            console.log(error);
            message.error('Timesheet Fetching Failed!');
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            return; // Exit the function if no token
        }

        fetchTimesheetData();  // Fetch the data when the component loads
    }, [currentWeek, token]);

    useEffect(() => {
        if (timesheetData) {
            timesheetData.forEach(entry => {
                const dateKey = moment(entry.date.rawData).format('YYYY-MM-DD');
                form.setFieldsValue({
                    [`hoursWorked_${dateKey}`]: entry.hoursWorked,
                    [`notes_${dateKey}`]: entry.notes,
                });
                if (entry.status === 'Approved') {
                    form.setFieldsValue({
                        [`hoursWorkedDisabled_${dateKey}`]: true,
                        [`notesDisabled_${dateKey}`]: true
                    });
                } else {
                    form.setFieldsValue({
                        [`hoursWorkedDisabled_${dateKey}`]: false,
                        [`notesDisabled_${dateKey}`]: false
                    });
                }
            });
        }
    }, [timesheetData, form]);

    const onFinish = (values) => {
        console.log("values", values);
        console.log(timesheetData)
        // timesheetData.forEach((timesheetObject) => {
        //     const timesheetDate = moment(timesheetObject.date.rawData).format('YYYY-MM-DD');
        //     const inputEntries = values[`entries_${timesheetDate}`];

        //     // Proceed only if inputEntries exist
        //     if (inputEntries) {
        //         // Create a Set for quick lookup of entries
        //         const entrySet = new Set(timesheetObject.entries.map(entry =>
        //             `${entry.hoursWorked}-${entry.projectId._id}`
        //         ));

        //         // Filter inputEntries based on whether they exist in the entrySet
        //         values[`entries_${timesheetDate}`] = inputEntries.filter(inputEntry => {
        //             const key = `${inputEntry.hoursWorked}-${inputEntry.projectId}`;
        //             return !entrySet.has(key); // Keep entries not found in timesheetObject.entries
        //         });
        //     }

        //     // Check if notes match and delete if they do
        //     if (timesheetObject.notes === values[`notes_${timesheetDate}`]) {
        //         values[`notes_${timesheetDate}`] = undefined; // Set to undefined instead of delete
        //     }
        // });

        let timesheetArray = [];
        const dateToIdMap = timesheetData.reduce((map, entry) => {
            const dateKey = moment(entry.date.rawData).format('YYYY-MM-DD');
            map[dateKey] = entry._id;
            return map;
        }, {});

        while (Object.keys(values).length > 0) {
            let date = Object.keys(values)[0].split('_')[1];
            const entries = values[`entries_${date}`] || [];
            // if (!values[`notes_${date}`]) {
            //     delete values[`notes_${date}`];
            //     continue;
            // };
            // if (!values[`entries_${date}`]) {
            //     delete values[`entries_${date}`];
            //     continue;
            // };

            timesheetArray.push({
                "_id": dateToIdMap[`${date}`],
                "userId": {
                    "_id": userId
                },
                "date": date,
                "entries": entries.map(e => ({
                    "projectId": {
                        "_id": e.projectId
                    },
                    "hoursWorked": e.hoursWorked,
                })),
                "totalHours": entries.reduce((total, e) => total + (e.hoursWorked || 0), 0),
                "status": "Submitted",
                "notes": values[`notes_${date}`]
            });
            delete values[`entries_${date}`]
            delete values[`notes_${date}`];
        };
        console.log(timesheetArray);
        if (timesheetArray.length > 0) {
            let data = JSON.stringify({ "keys": ["_id"], "docs": timesheetArray });
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${process.env.REACT_APP_DNIO_SERVICES_BASE_URL}/${process.env.REACT_APP_DNIO_APP_NAME}/${process.env.REACT_APP_DNIO_SERVICE_TIMESHEETS}/utils/bulkUpsert?update=true&insert=true`,
                headers: {
                    'accept': '*/*',
                    'Authorization': process.env.REACT_APP_DNIO_API_KEY,
                    'Content-Type': 'application/json'
                },
                data: data
            };
            setLoading(true);
            axios.request(config)
                .then((response) => {
                    console.log(JSON.stringify(response.data));
                    message.success('Submission successful!');
                    fetchTimesheetData();
                })
                .catch((error) => {
                    console.log(error);
                    setError(true);
                    message.error('Submission failed. Please try again.');
                }).finally(() => {
                    setLoading(false);
                })
        };
    };

    const addProjectEntry = (date) => {
        console.log("HELLO", date);
        const currentEntries = form.getFieldValue(`entries_${date}`) || [];
        form.setFieldsValue({
            [`entries_${date}`]: [...currentEntries, { projectId: null, hoursWorked: 0 }],
        });
        setFormState(prev => ({ ...prev }));
    };

    const removeProjectEntry = (date, index) => {
        const currentEntries = form.getFieldValue(`entries_${date}`) || [];
        const updatedEntries = currentEntries.filter((_, i) => i !== index); // Filter out the entry at the specified index
        form.setFieldsValue({
            [`entries_${date}`]: updatedEntries, // Update the form with the new entries
        });
        setFormState(prev => ({ ...prev }));
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 200,
            align: 'center',
            render: (date) => moment(date).format('dddd, MMM D'),
        },
        {
            title: 'Projects & Hours',
            key: 'projects',
            width: 500,
            align: 'center',
            render: (_, record) => {
                const dateKey = moment(record.date).format('YYYY-MM-DD');
                const entries = form.getFieldValue(`entries_${dateKey}`) || [];

                return (
                    <>
                        {entries.map((entry, index) => (
                            <div key={`${dateKey}_entry_${index}`} style={{ marginBottom: '0px', marginLeft: '20px' }}>
                                <Form.Item
                                    name={[`entries_${dateKey}`, index, 'projectId']}  // Make sure the index is part of the name
                                    style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}
                                    rules={[{ required: true, message: 'Please select a project' }]}
                                >
                                    <Select
                                        placeholder="Select project"
                                        disabled={form.getFieldValue(`entriesDisabled_${dateKey}`)}
                                        style={{ align: 'center' }}
                                    >
                                        {projects.map(project => (
                                            <Option key={project._id} value={project._id}>{project.project_name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name={[`entries_${dateKey}`, index, 'hoursWorked']}  // Index ensures the correct entry is targeted
                                    style={{ display: 'inline-block', width: 'calc(50% - 12px)', marginLeft: '8px' }}
                                    rules={[{ required: true, message: 'Please input hours worked' }]}
                                >
                                    <InputNumber
                                        min={0}
                                        max={24}
                                        placeholder="Hours"
                                        disabled={form.getFieldValue(`entriesDisabled_${dateKey}`)}
                                    />
                                    <Button
                                        type="link"
                                        onClick={() => removeProjectEntry(dateKey, index)}
                                        style={{
                                            marginLeft: '40px',
                                            color: '#333',  // Initial dark gray color
                                            backgroundColor: 'transparent',  // No background for a clean look
                                            fontSize: '14px',  // Smaller font size
                                            fontWeight: 'bold',
                                            padding: '10',  // No padding for a text-link feel
                                            border: 'none',  // No borders
                                            borderRadius: '0',  // Remove rounded corners
                                            transition: 'color 0.5s ease, text-shadow 0.5s ease',  // Smooth transition for hover
                                            textShadow: 'grey',  // No shadow initially
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            cursor: 'pointer'  // Pointer for clickable feel
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = 'red';
                                            e.currentTarget.style.textShadow = '0px 0px 8px rgba(255, 0, 0, 0.6)';  // Red glow effect
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = '#333';  // Revert back to dark gray color
                                            e.currentTarget.style.textShadow = 'none';  // Remove the shadow effect
                                        }}
                                    >
                                        x
                                    </Button>

                                </Form.Item>
                            </div>
                        ))}

                        <Button type="dashed" onClick={() => addProjectEntry(dateKey)} style={{ width: '100%' }}
                            disabled={moment(record.date).isAfter(today)}>
                            + Add Project
                        </Button>
                    </>
                );
            },
        },
        {
            title: 'Total Hours',
            key: 'total_hours',
            width: 150,
            align: 'center',
            render: (_, record) => {
                const dateKey = moment(record.date).format('YYYY-MM-DD');
                const entries = form.getFieldValue(`entries_${dateKey}`) || [];
                return entries.reduce((total, entry) => total + (entry.hoursWorked || 0), 0);
            },
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            width: 400,
            align: 'center',
            render: (text, record) => (
                <Form.Item
                    name={`notes_${moment(record.date).format('YYYY-MM-DD')}`}
                    rules={[{ required: moment(record.date).isSameOrBefore(today), message: 'Please input notes!' }]}
                >
                    <Input.TextArea
                        rows={2}
                        placeholder={moment(record.date).isSameOrBefore(today) ? 'Enter notes' : 'Disabled for future'}
                        disabled={moment(record.date).isAfter(today) || form.getFieldValue(`hoursWorkedDisabled_${moment(record.date).format('YYYY-MM-DD')}`)}
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => {
                let color;
                switch (status) {
                    case 'Approved': color = 'green'; break;
                    case 'Rejected': color = 'red'; break;
                    case 'Submitted': color = 'blue'; break;
                    default: color = 'gray';
                }
                return <Tag color={color}>{status || 'Pending'}</Tag>;
            }
        }
    ];

    const dataSource = days.map((day, index) => ({
        key: index,
        date: day,
        total_hours: form.getFieldValue(`entries_${moment(day).format('YYYY-MM-DD')}`)?.reduce((sum, e) => sum + e.hoursWorked, 0) || 0,
        status: timesheetData.find(entry => moment(entry.date.rawData).format('YYYY-MM-DD') === moment(day).format('YYYY-MM-DD'))?.status || 'Pending',
    }));

    return (
        <div className="timesheet-container">
            <Title level={2} className="timesheet-title">Weekly Timesheet</Title>
            <Card className="timesheet-card">
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Table dataSource={dataSource} columns={columns} pagination={false} />
                    <br />
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Submit</Button>
                    </Form.Item>
                </Form>
                <div className="navigation-buttons">
                    <Button type="default" onClick={goToPreviousWeek} style={{ marginRight: '60px' }}>Prior Week</Button>
                    <Button type="default" onClick={goToNextWeek}>Next Week</Button>
                </div>
            </Card>
        </div>
    );
};

export default Timesheet;
