import React, { useState } from "react";
import axios from "axios";
import "./Doctors.css";
import { Link, useNavigate } from "react-router-dom";

function Doctors() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [dermatologists, setDermatologists] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const API_BASE = "http://127.0.0.1:5001/doctors";

  const fetchDermatologists = async () => {
    const formattedLocation = location.trim().toLowerCase();
    if (!formattedLocation) {
      setErrorMessage("Please enter a location.");
      setDermatologists([]);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/by_location/${formattedLocation}`);
      setDermatologists(response.data);
      if (response.data.length === 0) {
        setErrorMessage(`No dermatologists found in "${location}".`);
      } else {
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };

  const handleDoctorClick = (doctor) => {
    navigate("/appointment", { state: { doctor } });
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-4">
        <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-center text-center">
          <h2 className="text-white mb-3 mb-md-0 text-center">
            Skin Specialist Appointment Booking
          </h2>
          <div className="d-flex flex-column flex-md-row ms-auto">
            <Link to={"/doclog"} className="btn btn-dark me-md-3 mb-2 mb-md-0 doctorlogin">
              🧑🏻‍⚕️Doctor Login
            </Link>
            <Link to={"/Chatbot"} className="btn btn-dark chatbot2">
              🤖Skin Disease Consultation
            </Link>
          </div>
        </div>
      </nav>

      <div className="containert mt-5 text-center find">
        <h2>Find a Skin Specialist</h2>
        <p>Search for a Dermatologist based on your location.</p>
        <input
          type="text"
          className="form-control2 w-10 twoo"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button className="btnfg btnfg2" onClick={fetchDermatologists}>
          Search
        </button>
        {errorMessage && (
          <p className="text-danger mt-2">{errorMessage}</p>
        )}
      </div>

      <div className="containery text-center mt-4 down mx-5">
        {dermatologists.length > 0 && (
          <h3>Available Dermatologists in {location}</h3>
        )}

        <div className="row">
          {dermatologists.map((doctor, index) => (
            <div key={index} className="col-md-6 mb-4">
              <div className="card p-3">
                <div className="d-flex align-items-center">
                  <img
                    src={doctor.image}
                    className="rounded-circle me-3"
                    width="105"
                    height="130"
                    alt={doctor.name}
                  />
                  <div>
                    <h5>{doctor.name}</h5>
                    <p><strong>Specialty:</strong> {doctor.specialty}</p>
                    <p><i className="fas fa-phone"></i> {doctor.contact}</p>
                    <p><strong>Rating:</strong> {doctor.rating}</p>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-2">
                  <button
                    className="btn btn-success w-50 d-flex align-items-center justify-content-center"
                    style={{ padding: "10px", fontSize: "16px" }}
                    onClick={() => handleDoctorClick(doctor)}
                  >
                    📅 Book Appointment
                  </button>
                  <a
                    href={`tel:${doctor.contact}`}
                    className="btn btn-primary w-50 d-flex align-items-center justify-content-center"
                    style={{ padding: "10px", fontSize: "16px" }}
                  >
                    📞 Call Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Doctors;