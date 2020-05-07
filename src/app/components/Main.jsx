import React from "react";
import { Provider } from "react-redux";
import { store } from "../store";
import { ConnectedDashboard } from "./Dashboard";
import { Router, Route } from "react-router-dom";
import { history } from "../store/history";
import { Redirect, Switch } from "react-router";
import { ConnectedLogin } from "./Login";
import { ConnectedClients } from "./Clients";
import { ConnectedClientsDetail } from "./ClientsDetail";
import { ConnectedClientsNew } from "./ClientsNew";
import { ConnectedMainHeader } from "./MainHeader";
import { ConnectedMainSidebar } from "./MainSiderbar";
import { ConnectedMainFooter } from "./MainFooter";

const RouteGuard = (Component) => ({ match }) =>
  !store.getState().session.authenticated ? (
    <Redirect to="/" />
  ) : (
    <div className="wrapper">
      <ConnectedMainHeader />
      <ConnectedMainSidebar />

      <div className="content-wrapper">
        {/* Content here */}
        <Component match={match} />
      </div>

      <ConnectedMainFooter />
    </div>
  );

//   <Component match={match} />

export const Main = () => (
  <Router history={history}>
    <Provider store={store}>
      <div>
        <Switch>
          <Route exact path="/" component={ConnectedLogin} />
          <Route
            exact
            path="/dashboard"
            render={RouteGuard(ConnectedDashboard)}
          />
          <Route exact path="/clients" render={RouteGuard(ConnectedClients)} />
          <Route
            exact
            path="/client/:id/:isEdit?"
            render={RouteGuard(ConnectedClientsDetail)}
          />
          <Route
            exact
            path="/add-contact"
            render={RouteGuard(ConnectedClientsNew)}
          />
        </Switch>
      </div>
    </Provider>
  </Router>
);
