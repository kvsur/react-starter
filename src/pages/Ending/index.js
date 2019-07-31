import React, { Component } from 'react';
import { Form, Button, Select, Input, message } from 'antd';
import { connect } from 'react-redux';

import history from '../../router-dom/history';
import Layout from '../../components/Layout';
import Bridge from '../../utils/bridge';
import { NO_OPRATION_TIME } from '../../constants/COMMON_ACTION_TYPES';
import { endClass } from '../../thunk/lesson';

// const electron = window.electron;
// const { ipcRenderer } = electron || {};


const formItemLayout = {
    labelCol: {
        xs: { span: 8 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 40 },
        sm: { span: 20 },
    },
};

const Item = Form.Item;

@Form.create()
@connect(({ lesson }) => ({
    ...lesson
}))
class Ending extends Component {
    timer = null;

    state = {
        loading: false,
        withinTime: true,
        time: NO_OPRATION_TIME,
    };

    componentDidMount() {
        // if (ipcRenderer) {
        //     setTimeout(() => {
        //         ipcRenderer.send('show');
        //     }, 10000);
        // }
        Bridge.on('class-will-end', this.handleClassEnd);
    }

    componentWillUnmount() {
        Bridge.cancel('class-will-end', this.handleClassEnd);
    }

    handleClassEnd = () => {
        this.setState({
            withinTime: false,
        });
        this.timer = setInterval(() => {
            const { time } = this.state;
            if (time === 0) {
                this.submit({preventDefault: () => {}});
            } else {
                this.setState({
                    time: time - 1
                });
            }
        }, 1000);
    }

    // 延迟下课
    delay = () => {
        clearInterval(this.timer);
        this.setState({
            withinTime: true,
        });
        Bridge.send('class-delay', 1);
    }

    // 继续上课
    justDoIt = () => {
        Bridge.send('close');
    }

    submit = async e => {
        clearInterval(this.timer);
        e.preventDefault();
        // if (ipcRenderer) {
        //     ipcRenderer.send('close');
        // }
        this.setState({
            loading: true,
        });
        let changeRoute = 0;
        try {
            const { dispatch, subjectId } = this.props;
            const time = new Date().getTime();
            
            await dispatch(endClass({time, subjectId}));

            Bridge.send('class-end', 0.5);
            changeRoute = 1;
        } catch (e) {
            message.error(e);
        } finally {
            this.setState({
                loading: false,
            }, () => {
                if (changeRoute) history.push('/login');
            });
        }
    };

    render() {
        // const { models, loading } = this.props;
        const { form: { getFieldDecorator }, className, subjectId, subjectList } = this.props;
        const { loading, withinTime, time } = this.state;
        const footer = (
            <div>
                {
                    withinTime ?
                        <Button type="default" onClick={this.justDoIt}>继续上课</Button>
                        :
                        <Button type="default" onClick={this.delay}>延迟5分钟</Button>
                }
                <Button type="primary" onClick={this.submit} loading={loading} style={{ marginLeft: '20px' }}>确认下课</Button>
            </div>
        );
        return (
            <Layout title="下课" footer={footer}>
                <Form {...formItemLayout}>
                    <Item required={false} label="班级">
                        {
                            getFieldDecorator('userAccount', {
                                rules: [{ required: true, message: '未选择班级' }],
                                initialValue: className,
                            })(
                                // <Input prefix={<Icon type="user" />} placeholder="选择班级" onPressEnter={this.submit} />
                                // <Select placeholder="选择班级" disabled></Select>
                                <Input placeholder="班级" disabled />
                            )
                        }
                    </Item>
                    <Item required={false} label="科目">
                        {
                            getFieldDecorator('password', {
                                rules: [{ required: true, message: '未选择科目' }],
                                initialValue: subjectId
                            })(
                                <Select placeholder="选择科目" disabled>
                                    {
                                        subjectList.map(item => {
                                            const { id, subjectName } = item;
                                            return (
                                                <Select.Option key={id} value={id} >{subjectName}</Select.Option>
                                            );
                                        })
                                    }
                                </Select>
                            )
                        }
                    </Item>
                    {
                        !withinTime ? <span>请确认下课，若无操作，录音将在{`${time}`}s 后自动关闭。</span> : null
                    }
                </Form>
            </Layout>
        )
    }
}

export default Ending;