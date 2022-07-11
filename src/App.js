import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Modal,
  Navbar,
  Row,
} from "react-bootstrap";
import { message, Progress } from "antd";
import "./App.css";
// import data from "./demoData.json";
import {
  getFollowersCount,
  getInstagram,
  getMedia,
  getMediaDetails,
  getPages,
  checkLogin,
  logout,
} from "./services/Services";
import LoadingAnimation from "./components/LoadingAnimation/LoadingAnimation";

function App() {
  const [init, setInit] = useState(false);
  const [loginStatus, setLoginStatus] = useState(false);
  const [data, setData] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [impression, setImpression] = useState(0);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [fullscreen, setFullscreen] = useState(true);
  useEffect(() => {
    try {
      if (!init) {
        window.fbAsyncInit = function () {
          window.FB.init({
            appId: process.env.REACT_APP_APPID,
            autoLogAppEvents: true,
            xfbml: true,
            version: "v14.0",
          });
          setInit(true);
          setLoading(false);
        };
        (function (d, s, id) {
          var js,
            fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) {
            return;
          }
          js = d.createElement(s);
          js.id = id;
          js.src = "https://connect.facebook.net/en_US/sdk.js";
          fjs.parentNode.insertBefore(js, fjs);
        })(document, "script", "facebook-jssdk");
      }
    } catch (err) {
      console.log(err);
      message.error("Something went wrong");
    }
  }, [init]);

  function handleShow(breakpoint) {
    setFullscreen(breakpoint);
    setShow(true);
  }

  async function loginHandler() {
    try {
      checkLogin(setLoginStatus, populateApp);
    } catch (err) {
      console.log(err);
      message.error("Something went wrong");
    }
  }

  async function logoutHandler() {
    try {
      setData([]);
      setFollowers(0);
      setImpression(0);
      logout(setLoginStatus);
    } catch (err) {
      console.log(err);
      message.error("Something went wrong");
    }
  }

  async function populateApp(accessToken) {
    setLoading(true);
    try {
      const pageId = await getPages(accessToken);
      const igId = await getInstagram(accessToken, pageId);
      const media = await getMedia(accessToken, igId);
      const d = await getMediaDetails(accessToken, media);
      setData(d);
      const followersCount = await getFollowersCount(accessToken, igId);
      setFollowers(followersCount);
      let count = 0;
      let sum = 0;
      d.forEach((dat, index) => {
        sum += (dat.engagement / followersCount) * 100;
        count += 1;
      });
      setImpression(Math.round(sum / count));
    } catch (err) {
      message.error(err);
    }
    setLoading(false);
  }

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="App min-vh-100 d-flex flex-column">
      <Modal
        size="md"
        show={show}
        fullscreen={fullscreen}
        onHide={() => setShow(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>The INSTAGAGE Engagement Rate Calculator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Engagement Rate is a metric tells the admin how many people are
            interacting with their posts as compared to their number of
            followers.
          </p>
          <p>
            To calculate the engagement rate we are finding the number of likes
            and comments on your last 3 posts(or less) and finding their
            percentage with respect to the number of followers of the admin and
            then taking their average to calculate the overall score.
          </p>
        </Modal.Body>
      </Modal>
      <Navbar>
        <Container>
          <Navbar.Brand className="brand-name">INSTAGAGE</Navbar.Brand>
          {loginStatus ? (
            <Button variant="secondary" onClick={logoutHandler}>
              Log out
            </Button>
          ) : (
            ""
          )}
        </Container>
      </Navbar>
      {!loginStatus ? (
        <>
          <div className="h-75 d-flex flex-column justify-content-center align-items-center">
            <h1 className="mt-5 welcome-note">Got a Business account?</h1>
            <h2 className="welcome-note">Check your Engagement rate</h2>
          </div>
          <div className="h-25 d-flex flex-grow-1 flex-column justify-content-center align-items-center landing-container">
            <Button onClick={loginHandler}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-facebook"
                viewBox="0 0 16 16"
              >
                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
              </svg>{" "}
              Login with Facebook
            </Button>
          </div>{" "}
        </>
      ) : (
        <div className="h-100 flex-grow-1 flex-column justify-content-center align-items-center landing-container">
          <div className="h-25 min-vh-25 d-flex align-items-center justify-content-center pt-3">
            <h1 className="impression-text pe-5">Your Overall Engagement </h1>{" "}
            <Progress
              type="circle"
              percent={impression}
              format={(percent) => percent}
            />
          </div>
          <div className="h-75 p-4">
            <h2 className="impression-text">
              Impressions of your last posts are
            </h2>
            <Container>
              <Row>
                {data.map((dat, index) => {
                  return (
                    <Col
                      className="xs-12 align-items-center justify-content-center d-flex flex-row"
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      key={index}
                    >
                      <Card className="mt-5" style={{ width: "18rem" }}>
                        <Card.Img
                          alt={dat.caption}
                          variant="top"
                          src={dat.media_url}
                          style={{ height: "200px" }}
                        />
                        <Card.Body className="card-t">
                          <Card.Text className="d-inline-block text-truncate w-100">
                            {dat.caption}
                          </Card.Text>
                        </Card.Body>
                        <Card.Footer className="card-imp">
                          Engagement{" "}
                          <Progress
                            type="circle"
                            width={50}
                            percent={Math.round(
                              (dat.engagement / followers) * 100
                            )}
                            format={(percent) => percent}
                          />
                        </Card.Footer>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Container>
          </div>
        </div>
      )}
      <div className="footer d-flex justify-content-end mb-3 me-3">
        <Button variant="secondary" onClick={() => handleShow("md-down")}>
          SEE HOW
        </Button>
      </div>
    </div>
  );
}

export default App;
