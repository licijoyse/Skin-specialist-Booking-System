import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Tabs,
  Tab,
  ListGroup,
  Card,
  Badge,
  Alert,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import "./Doctors.css";

const Doclog = () => {
  const [loginForm, setLoginForm] = useState({ doctorId: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    doctorId: "",
    username: "",
    password: "",
  });
  const [loggedInDoctor, setLoggedInDoctor] = useState(null);
  const [newSlot, setNewSlot] = useState({ date: "", time: "", status: "available" });
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [slots, setSlots] = useState([]);

  // Forgot Password Modal States
  const [showModal, setShowModal] = useState(false);
  const [resetDoctorId, setResetDoctorId] = useState("");
  const [resetUsername, setResetUsername] = useState("");  // Added username for reset
  const [newPassword, setNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const API_BASE = "http://127.0.0.1:5001";

  const fetchSlots = async (doctorId) => {
    try {
      const res = await axios.get(`${API_BASE}/doctors/slots/${doctorId}`);
      setSlots(res.data);
    } catch (err) {
      setError("Failed to fetch slots");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginForm.doctorId || !loginForm.password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/doctors/login`, loginForm);
      if (res.data.message === "Login successful") {
        setLoggedInDoctor(res.data.doctor);
        fetchSlots(res.data.doctor.doctorId);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const { doctorId, username, password } = registerForm;
    if (!doctorId || !username || !password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/doctors/register`, registerForm);
      if (res.data.message === "Doctor registered successfully") {
        setLoggedInDoctor({ doctorId, username });
        fetchSlots(doctorId);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setError("");

    const { date, time } = newSlot;
    if (!date || !time) {
      setError("Please fill in both date and time");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/doctors/add_slot`, {
        doctorId: loggedInDoctor.doctorId,
        date,
        time,
      });
      if (res.data.message === "Slot added successfully") {
        fetchSlots(loggedInDoctor.doctorId);
        setNewSlot({ date: "", time: "", status: "available" });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add slot");
    }
  };

  const handleRemoveSlot = async (slotId) => {
    try {
      await axios.delete(`${API_BASE}/doctors/remove_slot/${slotId}`);
      fetchSlots(loggedInDoctor.doctorId);
    } catch (err) {
      setError("Failed to remove slot");
    }
  };

  const handleConfirmSlot = async (slotId) => {
    try {
      await axios.put(`${API_BASE}/doctors/confirm_slot/${slotId}`);
      fetchSlots(loggedInDoctor.doctorId);
    } catch (err) {
      setError("Failed to confirm slot");
    }
  };

  const handleLogout = () => {
    setLoggedInDoctor(null);
    setSlots([]);
    setError("");
  };

  // Updated function to reset password using both doctorId and username
  const handleResetPassword = async () => {
    try {
      const res = await axios.post(`${API_BASE}/doctors/forgot_password`, {
        doctorId: resetDoctorId,
        username: resetUsername, // Send username for validation
        newPassword,
      });
      setResetMessage(res.data.message);
      setShowModal(false);
      setResetDoctorId("");
      setResetUsername("");  // Clear username after password reset
      setNewPassword("");
    } catch (err) {
      setResetMessage(err.response?.data?.error || "Failed to reset password");
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-4">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <h2 className="text-white text-center">Doctor Login</h2>
          <div className="d-flex ms-auto">
            <Link to="/" className="btn btn-dark">🏠Home</Link>
          </div>
        </div>
      </nav>

      <Container className="py-5 px-5 loginreg">
        {error && <Alert variant="danger">{error}</Alert>}
        {resetMessage && <Alert variant="info">{resetMessage}</Alert>}

        {!loggedInDoctor ? (
          <Card className="mx-auto" style={{ maxWidth: "500px" }}>
            <Card.Body>
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
                <Tab eventKey="login" title="Login">
                  <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                      <Form.Label>Doctor ID</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your Doctor ID"
                        value={loginForm.doctorId}
                        onChange={(e) => setLoginForm({ ...loginForm, doctorId: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Button variant="dark" type="submit" className="w-100">Login</Button>
                  </Form>
                  <div className="mt-3 text-end">
                    <Button variant="link" onClick={() => setShowModal(true)}>
                      Forgot Password?
                    </Button>
                  </div>
                </Tab>

                <Tab eventKey="register" title="Register">
                  <Form onSubmit={handleRegister}>
                    <Form.Group className="mb-3">
                      <Form.Label>Doctor ID</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter unique Doctor ID"
                        value={registerForm.doctorId}
                        onChange={(e) => setRegisterForm({ ...registerForm, doctorId: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter username"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Button variant="dark" type="submit" className="w-100">Register</Button>
                  </Form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        ) : (
          <>
            <Card className="mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <h2 className="mb-0">Welcome, Dr. {loggedInDoctor.username.toUpperCase()}</h2>
                  <Button variant="outline-dark" onClick={handleLogout}>Logout</Button>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <h3>Add New Slot</h3>
                <Form onSubmit={handleAddSlot}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={newSlot.time}
                      onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Button variant="dark" type="submit">Add Slot</Button>
                </Form>

                <h3 className="mt-4">Your Slots</h3>
                <ListGroup>
                  {slots.map((slot) => (
                    <ListGroup.Item key={slot.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Date:</strong> {slot.date} <strong>Time:</strong> {slot.time}
                      </div>
                      <div>
                        <Badge bg={slot.status === "available" ? "success" : "danger"} className="me-2">
                          {slot.status}
                        </Badge>
                        <Button variant="outline-danger" size="sm" onClick={() => handleRemoveSlot(slot.id)} className="me-2">
                          Remove
                        </Button>
                        {slot.status === "available" && (
                          <Button variant="outline-success" size="sm" onClick={() => handleConfirmSlot(slot.id)}>
                            Confirm
                          </Button>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </>
        )}

        {/* Forgot Password Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Reset Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Doctor ID</Form.Label>
                <Form.Control
                  type="text"
                  value={resetDoctorId}
                  onChange={(e) => setResetDoctorId(e.target.value)}
                  placeholder="Enter Doctor ID"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  placeholder="Enter Username"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter New Password"
                />
              </Form.Group>
              <Button variant="dark" onClick={handleResetPassword} className="w-100">Reset Password</Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
};

export default Doclog;
