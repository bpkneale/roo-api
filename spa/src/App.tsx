import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { useMemo } from "react";
import { Telemetry } from "./pages/Telemetry";
import { Sightings } from "./pages/sightings";

const NavItems = [
  {
    route: "/sightings",
    text: "Sightings",
    element: <Sightings />
  },
  {
    route: "/telemetry",
    text: "Telemetry",
    element: <Telemetry />
  }
]

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
        typography: {
          button: {
            textTransform: 'none'
          }
        }
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <div className="h-screen flex flex-col align-center justify-center">
        <Router>
          <nav className="flex flex-row">
            {NavItems.map(item => {
              return <Link key={item.route} to={item.route} className="p-2 lg:p-5">{item.text}</Link>
            })}
          </nav>
          <div className="h-screen flex flex-col align-center justify-center lg:p-5">
            <Switch>
              {NavItems.map(item => {
                return <Route path={item.route}> {item.element} </Route>
              })}
              <Route path="/"><Redirect to="/sightings" /></Route>
            </Switch>
          </div>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
