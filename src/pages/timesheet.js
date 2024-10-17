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
            const formValues = {};

            timesheetData.forEach(entry => {
                const dateKey = moment(entry.date.rawData).format('YYYY-MM-DD');
                formValues[`entries_${dateKey}`] = [];
                entry.entries.forEach((entryItem, index) => {
                    formValues[`entries_${dateKey}`].push({
                        ['projectId']: entryItem.projectId._id,
                        ['hoursWorked']: entryItem.hoursWorked,
                    });
                });

                formValues[`totalHours_${dateKey}`] = entry.totalHours;
                formValues[`notes_${dateKey}`] = entry.notes;

                if (entry.status === 'Approved') {
                    formValues[`entriesDisabled_${dateKey}`] = true;
                    formValues[`notesDisabled_${dateKey}`] = true;
                } else {
                    formValues[`entriesDisabled_${dateKey}`] = false;
                    formValues[`notesDisabled_${dateKey}`] = false;
                }
            });

            form.setFieldsValue(formValues);
            setFormState(prev => ({ ...prev }));
        }
    }, [timesheetData, form]);

    function combineNotesAndEntries(values) {
        const combinedResult = {};

        Object.keys(values).forEach(key => {
            const [type, date] = key.split('_');  // Split into "notes"/"entries" and date parts
            if (!combinedResult[date]) {
                combinedResult[date] = { date };  // Initialize date entry
            }

            if (type === 'notes') {
                combinedResult[date].notes = values[key];
            } else if (type === 'entries') {
                combinedResult[date].entries = values[key];
            }
        });

        return Object.values(combinedResult);  // Convert the result to an array of objects
    };

    const onFinish = (values) => {
        let combineNotesAndEntriesArray = combineNotesAndEntries(values);

        let timesheetArray = [];
        const dateToIdMap = timesheetData.reduce((map, entry) => {
            const dateKey = moment(entry.date.rawData).format('YYYY-MM-DD');
            map[dateKey] = entry._id;
            return map;
        }, {});

        const today = moment();
        combineNotesAndEntriesArray.forEach((item) => {
            if (moment(item.date).isSameOrBefore(today, 'day')) {
                timesheetArray.push({
                    "_id": dateToIdMap[`${item.date}`],
                    "userId": {
                        "_id": userId
                    },
                    "date": item.date,
                    "entries": item.entries ? item.entries.map(e => ({
                        "projectId": {
                            "_id": e.projectId
                        },
                        "hoursWorked": e.hoursWorked,
                    })) : [],
                    "totalHours": item.entries ? item.entries.reduce((total, e) => total + (e.hoursWorked || 0), 0) : 0,
                    "status": "Submitted",
                    "notes": item.notes
                });
            }
        });
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
        const currentEntries = form.getFieldValue(`entries_${date}`) || [];
        form.setFieldsValue({
            [`entries_${date}`]: [...currentEntries, { projectId: null, hoursWorked: 0 }],
        });
        setFormState(prev => ({ ...prev }));
    };

    const removeProjectEntry = (date, index) => {
        const currentEntries = form.getFieldValue(`entries_${date}`) || [];
        const updatedEntries = currentEntries.filter((entry, i) => i !== index); // Filter out the entry at the specified index

        // Recalculate total hours after the entry is removed
        const totalHours = updatedEntries.reduce((acc, entry) => acc + (entry.hoursWorked || 0), 0);

        form.setFieldsValue({
            [`entries_${date}`]: updatedEntries, // Update the form with the new entries
            [`totalHours_${date}`]: totalHours, // Update the total hours field
        });

        setFormState(prev => ({ ...prev }));
    };

    const handleHoursChange = (value, dateKey, index) => {
        // Get current form values
        const entries = form.getFieldValue(`entries_${dateKey}`) || [];

        // Update the current entry with the new value
        entries[index].hoursWorked = value;

        // Calculate total hours by summing hoursWorked for all entries
        const totalHours = entries.reduce((acc, entry) => acc + (entry.hoursWorked || 0), 0);

        if (totalHours > 24) {
            // Set an error on the 'hoursWorked' field
            form.setFields([
                {
                    name: [`entries_${dateKey}`, index, 'hoursWorked'],
                    errors: ['Total hours worked cannot exceed 24 hours.'],
                },
            ]);
        } else {
            // Clear the error if within the limit
            form.setFields([
                {
                    name: [`entries_${dateKey}`, index, 'hoursWorked'],
                    errors: [],
                },
            ]);

            // Update totalHours field
            form.setFieldsValue({ [`totalHours_${dateKey}`]: totalHours });
        }
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
                            <div key={`${dateKey}_projectId_${index}`} style={{ marginBottom: '0px', marginLeft: '10px' }}>
                                <Form.Item
                                    name={[`entries_${dateKey}`, index, 'projectId']} // Name structure to match your requirement
                                    style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}
                                    rules={[{ required: true, message: 'Please select a project' }]}
                                    initialValue={entry['projectId']} // Populate with entry value
                                >
                                    <Select
                                        placeholder="Select project"
                                        disabled={form.getFieldValue(`entriesDisabled_${dateKey}`)}
                                    >
                                        {projects.map(project => (
                                            <Option key={project._id} value={project._id}>
                                                {project.projectName}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name={[`entries_${dateKey}`, index, 'hoursWorked']} // Correct name structure
                                    style={{ display: 'inline-block', width: 'calc(50% - 12px)', marginLeft: '0px' }}
                                    rules={[{ required: true, message: 'Please input hours worked' }]}
                                    initialValue={entry['hoursWorked']} // Populate with entry value
                                >
                                    <InputNumber
                                        min={0}
                                        max={24}
                                        placeholder="Hours"
                                        disabled={form.getFieldValue(`entriesDisabled_${dateKey}`)}
                                        onChange={(value) => handleHoursChange(value, dateKey, index)} // Handle hours change
                                    />
                                </Form.Item>

                                <Button
                                    type="link"
                                    onClick={() => removeProjectEntry(dateKey, index)}
                                    style={{
                                        marginLeft: '0px',
                                        marginRight: '10px',
                                        color: '#333',  // Initial dark gray color
                                        backgroundColor: 'transparent',  // No background for a clean look
                                        fontSize: '14px',  // Smaller font size
                                        fontWeight: 'bold',
                                        padding: '0',  // No padding for a text-link feel
                                        border: 'none',  // No borders
                                        borderRadius: '0',  // Remove rounded corners
                                        transition: 'color 0.5s ease, text-shadow 0.5s ease',  // Smooth transition for hover
                                        textShadow: 'grey',  // No shadow initially
                                        display: 'inline-flex',
                                        alignItems: 'left',
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
                const totalHours = form.getFieldValue(`totalHours_${dateKey}`) || 0;
                return totalHours;
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
