import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, InputNumber, Table, message } from 'antd';
import moment from 'moment';
import axios from 'axios';
import jwt from 'jsonwebtoken';


const { Title } = Typography;

const Timesheet = () => {
    const [currentWeek, setCurrentWeek] = useState(moment().startOf('week'));
    const [form] = Form.useForm();

    // Calculate the start and end of the week based on the currentWeek state
    const startOfWeek = currentWeek.clone().startOf('week');
    const endOfWeek = currentWeek.clone().endOf('week');
    const today = moment().endOf('day'); // Define today's date to disable future fields

    // Generate all 7 days for the selected week (Monday to Sunday)
    const days = [];
    let day = startOfWeek.clone();
    while (day <= endOfWeek) {
        days.push(day.clone()); // Clone the day to avoid reference issues
        day = day.add(1, 'day');
    }

    // Navigate to the previous week
    const goToPreviousWeek = () => {
        setCurrentWeek(currentWeek.clone().subtract(1, 'week'));
    };

    // Navigate to the next week
    const goToNextWeek = () => {
        setCurrentWeek(currentWeek.clone().add(1, 'week'));
    };

    const token = localStorage.getItem('token');
    const decoded = jwt.decode(token);
    // Extract the userId (which is in the sub field)
    const userId = decoded.sub;

    // Form submission handler
    const onFinish = (values) => {
        let timesheetArray = [];
        while (Object.keys(values).length > 0) {
            let date = Object.keys(values)[0].split('_')[1];

            if (!values[`hoursWorked_${date}`] && !values[`notes_${date}`]) {
                delete values[`hoursWorked_${date}`];
                delete values[`notes_${date}`];
                continue;
            }

            timesheetArray.push(
                {
                    "_id": null,
                    "userId": {
                        "_id": userId
                    },
                    "date": date,
                    "hoursWorked": values[`hoursWorked_${date}`],
                    "status": "Submitted",
                    "notes": values[`notes_${date}`]
                }
            );
            delete values[`hoursWorked_${date}`];
            delete values[`notes_${date}`];
        };
        let data = JSON.stringify({
            "keys": [
                "_id"
            ],
            "docs": timesheetArray
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${process.env.REACT_APP_DNIO_SERVICES_BASE_URL}/${process.env.REACT_APP_DNIO_APP_NAME}/${process.env.REACT_APP_DNIO_SERVICE_TIMESHEET}/utils/bulkUpsert?update=true&insert=true`,
            headers: {
                'accept': '*/*',
                'Authorization': process.env.REACT_APP_DNIO_API_KEY,
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                message.success('Submission successful!');
            })
            .catch((error) => {
                console.log(error);
                message.error('Submission failed. Please try again.');
            });
    };

    // Table columns
    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => moment(date).format('dddd, MMM D'), // Correctly format the date
        },
        {
            title: 'Hours Worked',
            dataIndex: 'hoursWorked',
            key: 'hoursWorked',
            render: (text, record) => (
                <Form.Item
                    name={`hoursWorked_${moment(record.date).format('YYYY-MM-DD')}`} // Unique name for each row
                    rules={[{ required: moment(record.date).isSameOrBefore(today), message: 'Please input hours!' }]}
                >
                    <InputNumber
                        min={0}
                        max={24}
                        placeholder="Hours"
                        disabled={moment(record.date).isAfter(today)} // Disable future dates
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
                    name={`notes_${moment(record.date).format('YYYY-MM-DD')}`} // Unique name for each row
                    rules={[{ required: moment(record.date).isSameOrBefore(today), message: 'Please input notes!' }]}
                >
                    <Input.TextArea
                        rows={2}
                        placeholder={moment(record.date).isSameOrBefore(today) ? 'Enter notes' : 'Disabled for future'}
                        disabled={moment(record.date).isAfter(today)} // Disable future dates
                    />
                </Form.Item>
            ),
        },
    ];

    // Table data
    const dataSource = days.map((day, index) => ({
        key: index,
        date: day, // Each day is now correctly passed
    }));

    return (
        <div className="timesheet-container">
            <Title level={2} className="timesheet-title">Weekly Timesheet</Title>
            <Card className="timesheet-card">
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    {/* <Form.Item label="Select Week">
                        <RangePicker
                            value={[startOfWeek, endOfWeek]}
                            format="YYYY-MM-DD"
                            disabled
                        />
                    </Form.Item> */}

                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        pagination={false}
                    />

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>

                <div className="navigation-buttons">
                    <Button
                        type="default"
                        onClick={goToPreviousWeek}
                    >
                        Previous Week
                    </Button>
                    <Button
                        type="default"
                        onClick={goToNextWeek}
                    >
                        Next Week
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default Timesheet;
