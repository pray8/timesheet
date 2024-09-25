import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Card, InputNumber, Table, message, Tag } from 'antd';
import moment from 'moment';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Timesheet = () => {
    const [currentWeek, setCurrentWeek] = useState(moment().startOf('week'));
    const [form] = Form.useForm();
    const [timesheetData, setTimesheetData] = useState([]);
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

    useEffect(() => {
        if (!token) {
            return; // Exit the function if no token
        }

        const fetchTimesheetData = async () => {
            setLoading(true);
            try {
                let config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: `${process.env.REACT_APP_DNIO_SERVICES_BASE_URL}/${process.env.REACT_APP_DNIO_APP_NAME}/${process.env.REACT_APP_DNIO_SERVICE_TIMESHEETS}/?filter={"$and":[{"date.tzData":{"$gte":"${startOfWeek.format('YYYY-MM-DD')}","$lte":"${endOfWeek.format('YYYY-MM-DD')}"}}, {"userId._id": "${userId}"}]}`,
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
        fetchTimesheetData();
    }, [currentWeek, token]);

    useEffect(() => {
        if (timesheetData) {
            timesheetData.forEach(entry => {
                const dateKey = moment(entry.date.tzData).format('YYYY-MM-DD');
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
        timesheetData.forEach((timesheetObject, index) => {
            const timesheetDate = moment(timesheetObject.date.tzData).format('YYYY-MM-DD');
            if (timesheetObject.hoursWorked === values[`hoursWorked_${timesheetDate}`]) {
                delete values[`hoursWorked_${timesheetDate}`];
            }
            if (timesheetObject.notes === values[`notes_${timesheetDate}`]) {
                delete values[`notes_${timesheetDate}`];
            }
        });
        let timesheetArray = [];
        const dateToIdMap = timesheetData.reduce((map, entry) => {
            const dateKey = moment(entry.date.tzData).format('YYYY-MM-DD');
            map[dateKey] = entry._id;
            return map;
        }, {});
        while (Object.keys(values).length > 0) {
            let date = Object.keys(values)[0].split('_')[1];
            if (!values[`hoursWorked_${date}`] && !values[`notes_${date}`]) {
                delete values[`hoursWorked_${date}`];
                delete values[`notes_${date}`];
                continue;
            }
            timesheetArray.push({
                "_id": dateToIdMap[`${date}`],
                "userId": { "_id": userId },
                "date": date,
                "hoursWorked": values[`hoursWorked_${date}`],
                "status": "Submitted",
                "notes": values[`notes_${date}`]
            });
            delete values[`hoursWorked_${date}`];
            delete values[`notes_${date}`];
        }
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

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => moment(date).format('dddd, MMM D'),
        },
        {
            title: 'Hours Worked',
            dataIndex: 'hoursWorked',
            key: 'hoursWorked',
            render: (text, record) => (
                <Form.Item
                    name={`hoursWorked_${moment(record.date).format('YYYY-MM-DD')}`}
                    rules={[{ required: moment(record.date).isSameOrBefore(today), message: 'Please input hours!' }]}
                >
                    <InputNumber
                        min={0}
                        max={24}
                        placeholder="Hours"
                        disabled={moment(record.date).isAfter(today) || form.getFieldValue(`hoursWorkedDisabled_${moment(record.date).format('YYYY-MM-DD')}`)}
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
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
            render: (status) => {
                let color;
                switch (status) {
                    case 'Approved': color = 'green'; break;
                    case 'Rejected': color = 'red'; break;
                    case 'Submitted': color = 'blue'; break;
                    default: color = 'gray';
                }
                return <Tag color={color}>{status ? status : 'Pending'}</Tag>;
            }
        }
    ];

    const dataSource = days.map((day, index) => ({
        key: index,
        date: day,
        hoursWorked: form.getFieldValue(`hoursWorked_${moment(day).format('YYYY-MM-DD')}`),
        notes: form.getFieldValue(`notes_${moment(day).format('YYYY-MM-DD')}`),
        status: timesheetData.find(entry => moment(entry.date.tzData).format('YYYY-MM-DD') === moment(day).format('YYYY-MM-DD'))?.status || 'Pending',
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
