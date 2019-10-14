import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getClassInfo } from '../../thunk/global';

@connect()
class Initial extends PureComponent {
    UNSAFE_componentWillMount() {
        const { dispatch } = this.props;

        dispatch(getClassInfo());
    }

    render() {
        return (
            <div style={{display: 'none'}} />
        )
    }
}

export default Initial;
