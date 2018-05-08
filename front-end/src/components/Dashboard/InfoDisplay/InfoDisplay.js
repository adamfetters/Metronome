import React from 'react';

import { Route, Switch } from 'react-router-dom';

import Assignments from '../InfoDisplay/Assignments/Assignments';
import Billing from '../InfoDisplay/Billing/index';
import UserSettings from '../InfoDisplay/UserSettings/UserSettings';


const InfoDisplay = props => (
  <div>
    <Switch>
      <Route path={`${props.match.path}/assignments`} component={Assignments} />
      <Route path={`${props.match.path}/billing`} component={Billing} />
      <Route path={`${props.match.path}/settings`} component={UserSettings} />
    </Switch>
  </div>
);

export default InfoDisplay;
