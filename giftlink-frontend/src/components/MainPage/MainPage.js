import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { urlConfig } from "../../config";

function MainPage() {
  const [gifts, setGifts] = useState([]); // Holds list of gifts from backend
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all gifts from backend when component mounts
    const fetchGifts = async () => {
      try {
        let url = `${urlConfig.backendUrl}/api/gifts`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error; ${response.status}`);
        }
        const data = await response.json();
        setGifts(data);
      } catch (error) {
        console.error("Fetch error: " + error.message);
      }
    };

    fetchGifts();
  }, []);

  // Navigate to details page for a specific gift
  const goToDetailsPage = (productId) => {
    navigate(`/app/product/${productId}`);
  };

  // Format Unix timestamp (seconds) into readable date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("default", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Return CSS class based on condition
  const getConditionClass = (condition) => {
    return condition === "New"
      ? "list-group-item-success"
      : "list-group-item-warning";
  };

  return (
    <div className="container mt-5">
      <div className="row">
        {gifts.map((gift) => (
          <div key={gift.id} className="col-md-4 mb-4">
            <div className="card product-card">
              {/* // Gift image or placeholder */}
              <div className="image-placeholder">
                {gift.image ? (
                  <img
                    src={gift.image}
                    alt={gift.name}
                    className="card-img-top"
                  />
                ) : (
                  <div className="no-image-available">No Image Available</div>
                )}
              </div>

              {/* // Gift details */}
              <div className="card-body">
                <h5 className="card-title">{gift.name}</h5>

                <p className={`card-text ${getConditionClass(gift.condition)}`}>
                  {gift.condition}
                </p>

                <p className="card-text">
                  {gift.date_added
                    ? formatDate(gift.date_added)
                    : "Date not available"}
                </p>

                {/* Button to navigate to details page */}
                <button
                  onClick={() => goToDetailsPage(gift.id)}
                  className="btn btn-primary"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainPage;
