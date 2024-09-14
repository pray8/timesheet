import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, InputNumber, Table } from 'antd';
import moment from 'moment';

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

    // Form submission handler
    const onFinish = (values) => {
        console.log('Form values:', values);
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
