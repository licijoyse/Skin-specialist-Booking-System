import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";
import "./Doctors.css";

const Appointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [formData, setFormData] = useState({
    patientName: "",
    phoneNumber: "",
    address: "",
  });
  const [error, setError] = useState("");
  const API_BASE = "http://127.0.0.1:5001";

  // Helper function to convert time string to 24-hour format if needed.
  function convertTo24Hour(timeStr) {
    if (!timeStr.toUpperCase().includes("AM") && !timeStr.toUpperCase().includes("PM")) {
      return timeStr;
    }
    let [time, modifier] = timeStr.split(" ");
    let [hours, minutes, seconds] = time.split(":");
    hours = parseInt(hours, 10);
    seconds = seconds ? seconds : "00";
    if (modifier.toUpperCase() === "PM" && hours < 12) {
      hours += 12;
    }
    if (modifier.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes}:${seconds}`;
  }

  useEffect(() => {
    if (location.state?.doctor) {
      setDoctor(location.state.doctor);
      fetchDoctorSlots(location.state.doctor.doctorId);
    } else {
      navigate("/");
    }
  }, [location, navigate]);

  const fetchDoctorSlots = async (doctorId) => {
    try {
      const response = await axios.get(`${API_BASE}/doctors/slots/${doctorId}`);
      setSlots(response.data);
    } catch (err) {
      setError("Error fetching slots");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { patientName, phoneNumber, address } = formData;
    if (!patientName || !phoneNumber || !address || !selectedSlotId) {
      setError("All fields are required");
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(patientName)) {
      setError("Patient name should contain only alphabets and spaces");
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    const slot = slots.find((s) => s.id === parseInt(selectedSlotId));
    if (!slot || slot.status !== "available") {
      setError("Invalid or already booked slot");
      return;
    }
    sendWhatsAppMessage(
      patientName,
      phoneNumber,
      address,
      slot.date,
      slot.time,
      doctor.name,
      doctor.contact
    );
    updateSlotStatus(selectedSlotId);
  };

  // Updated sendWhatsAppMessage function with number formatting
  const sendWhatsAppMessage = (name, phone, address, date, time, doctorName, doctorContact) => {
    // Clean the doctor's contact number
    let cleanedNumber = doctorContact.replace(/[^\d]/g, ""); // Remove all non-digits

    // Handle Indian numbers
    if (cleanedNumber.length === 10) {
      // If only 10 digits (like 9876543210), add country code
      cleanedNumber = "91" + cleanedNumber;
    } else if (cleanedNumber.length === 12 && cleanedNumber.startsWith("91")) {
      // Already correct (e.g., 919876543210)
      // Do nothing
    } else {
      alert("Invalid Indian mobile number format for WhatsApp.");
      return;
    }

    const message = `Hello Dr. ${doctorName},%0A%0AI would like to book an appointment.%0A%0A*Patient Name:* ${name}%0A*Phone Number:* ${phone}%0A*Address:* ${address}%0A*Preferred Date:* ${date}%0A*Preferred Time:* ${time}%0A%0AThank you!`;

    const whatsappLink = `https://wa.me/${cleanedNumber}?text=${message}`;
    window.open(whatsappLink, "_blank");
  };

  const updateSlotStatus = async (slotId) => {
    try {
      await axios.put(`${API_BASE}/doctors/confirm_slot/${slotId}`);
      fetchDoctorSlots(doctor.doctorId);
    } catch (err) {
      setError("Error updating slot status");
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-3">
        <div className="container">
          <h2 className="text-white">Booking Form</h2>
          <Link to="/" className="btn btn-dark">🏠Home</Link>
        </div>
      </nav>
      <Container className="mt-5 p-4 rounded shadow bg-white">
        {error && <Alert variant="danger">{error}</Alert>}
        <h2 className="text-center">Book Appointment with {doctor?.name}</h2>
        <p><strong>Specialty:</strong> {doctor?.specialty}</p>
        <p><strong>Contact:</strong> {doctor?.contact}</p>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Patient Name:</Form.Label>
              <Form.Control type="text" name="patientName" value={formData.patientName} onChange={handleChange} placeholder="Enter your name" />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Phone Number:</Form.Label>
              <Form.Control type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Enter your phone number" />
            </Col>
          </Row>
          <Row>
            <Col md={12} className="mb-3">
              <Form.Label>Address:</Form.Label>
              <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter your address" />
            </Col>
          </Row>
          <Row>
            <Col md={12} className="mb-3">
              <Form.Label>Select Slot:</Form.Label>
              <Form.Select value={selectedSlotId} onChange={(e) => setSelectedSlotId(e.target.value)}>
                <option value="">Choose a slot</option>
                {slots.map((slot) => {
                  const normalizedTime = convertTo24Hour(slot.time);
                  const dateObj = new Date(`1970-01-01T${normalizedTime}`);
                  const formattedTime = isNaN(dateObj.getTime())
                    ? "Invalid Time"
                    : dateObj.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      });
                  return (
                    <option key={slot.id} value={slot.id} disabled={slot.status !== "available"}>
                      {slot.date} - {formattedTime} {slot.status !== "available" ? "(Booked)" : ""}
                    </option>
                  );
                })}
              </Form.Select>
            </Col>
          </Row>
          <Button variant="success" className="w-100 mt-3" type="submit">Submit</Button>
        </Form>
      </Container>
    </>
  );
};

export default Appointment;
