import React, { useState, useEffect } from "react";
import "./CameraTable.css";
import logo from "../img/wobot_logo_blue.svg";

const CameraTable = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [camerasPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [locations, setLocations] = useState([]);

  console.log("camera data" , cameras);

  // fetching Cameras data
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await fetch(
          "https://api-app-staging.wobot.ai/app/v1/fetch/cameras",
          {
            headers: {
              Authorization: "Bearer 4ApVMIn5sTxeW7GQ5VWeWiy",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();
        setCameras(result.data || []);

        const uniqueLocations = Array.from(
          new Set(result.data.map((camera) => camera.location))
        );
        setLocations(["All", ...uniqueLocations]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, []);

  //   update Status
  const updateStatus = async (cameraId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const payload = { id: cameraId, status: newStatus };

    console.log("Attempting to update status with payload:", payload);

    try {
      const response = await fetch(
        "https://api-app-staging.wobot.ai/app/v1/update/camera/status",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer 4ApVMIn5sTxeW7GQ5VWeWiy",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      setCameras((prevCameras) =>
        prevCameras.map((camera) =>
          camera.id === cameraId ? { ...camera, status: newStatus } : camera
        )
      );
    } catch (err) {
      console.error("Error updating status:", err.message);
      setError(`Error updating status: ${err.message}`);
    }
  };

  //   delete Camera
  const deleteCamera = (id) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this camera?"
    );
    if (confirmation) {
      setCameras((prevCameras) =>
        prevCameras.filter((camera) => camera.id !== id)
      );
    }
  };

  // Filter cameras based on search term, status, and location
  const filteredCameras = cameras.filter((camera) => {
    const matchesSearch =
      camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || camera.status === statusFilter;
    const matchesLocation =
      locationFilter === "All" || camera.location === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Pagination logic
  const indexOfLastCamera = currentPage * camerasPerPage;
  const indexOfFirstCamera = indexOfLastCamera - camerasPerPage;
  const currentCameras = filteredCameras.slice(
    indexOfFirstCamera,
    indexOfLastCamera
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="main-container">
      <div className="header">
        <img src={logo} alt="logo" />
      </div>

      <div className="table-title">
        <div>
          <h1>Cameras</h1>
          <p>Manage your cameras here</p>
        </div>
        <div className="search-right">
          <input
            type="text"
            className="search-input"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="search-icon fa fa-search"></i>{" "}
        </div>
      </div>

      <div className="dropdown-filter">
        <div className="dropdown-container">
          <i className="fas fa-map-marker-alt location-icon"></i>
          <select
            className="location-filter"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="All">Location</option>
            {locations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="dropdown-container">
          <i className="fas fa-tasks status-icon"></i>
          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="camera-table">
          <thead>
            <tr>
              <th className="checkbox-header">Select</th>
              <th>NAME</th>
              <th>HEALTH</th>
              <th>LOCATION</th>
              <th>RECORDER</th>
              <th>TASKS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentCameras.map((camera) => (
              <tr key={camera._id}>
                <td className="checkbox-cell">
                  <input type="checkbox" />
                </td>
                <td>{camera.name}</td>
                <td>
                  <span style={{ marginRight: "10px" }}>
                    <i className="fas fa-cloud" style={{ marginRight: "5px" }}></i>
                    {camera.health.cloud}
                  </span>
                  <span>
                    {" "}
                    <i className="fas fa-server" style={{ marginRight: "5px" }}></i>
                    {camera.health.device}
                  </span>
                </td>
                <td>{camera.location}</td>
                <td>{camera.recorder || "N/A"}</td>
                <td>{camera.tasks || "N/A"} Tasks</td>
                <td>
                  <span className={`status ${camera.status.toLowerCase()}`}>
                    {camera.status}
                  </span>
                </td>
                <td>
                  <i
                    className="fas fa-sync-alt action-button"
                    onClick={() => updateStatus(camera.id, camera.status)}
                  ></i>
                  <i
                    className="fas fa-trash delete-button"
                    onClick={() => deleteCamera(camera.id)}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <button
          className={`pagination-button ${currentPage === 1 ? "disabled" : ""}`}
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <i className="fas fa-chevron-left"></i> Previous
        </button>

        <span className="page-info">
          Page <strong>{currentPage}</strong> of{" "}
          <strong>{Math.ceil(filteredCameras.length / camerasPerPage)}</strong>
        </span>

        <button
          className={`pagination-button ${
            currentPage === Math.ceil(filteredCameras.length / camerasPerPage)
              ? "disabled"
              : ""
          }`}
          onClick={() => paginate(currentPage + 1)}
          disabled={
            currentPage === Math.ceil(filteredCameras.length / camerasPerPage)
          }
        >
          Next <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default CameraTable;
