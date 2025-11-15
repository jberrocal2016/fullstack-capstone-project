import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DetailsPage.css";
import { urlConfig } from "../../config";

function DetailsPage() {
  // React Router hooks
  const navigate = useNavigate();
  const { productId } = useParams();

  // Local state
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showerr, setShowerr] = useState(null);

  // Runs when productID changes
  useEffect(() => {
    // Check authentication before fetching
    const authenticationToken = sessionStorage.getItem("auth-token");
    if (!authenticationToken) {
      navigate("/app/login");
      return; // Stop execution if not authenticated
    }

    // Fetch gift details from backend
    const fetchGift = async () => {
      try {
        const url = `${urlConfig.backendUrl}/api/gifts/${productId}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setGift(data);
      } catch (error) {
        setShowerr(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGift();

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [productId, navigate]);

  // Navigate back to previous page
  const handleBackClick = () => {
    // Task 4: Handle back click
    navigate(-1);
  };

  //The comments have been hardcoded for this project.
  const comments = [
    {
      author: "John Doe",
      comment: "I would like this!",
    },
    {
      author: "Jane Smith",
      comment: "Just DMed you.",
    },
    {
      author: "Alice Johnson",
      comment: "I will take it if it's still available.",
    },
    {
      author: "Mike Brown",
      comment: "This is a good one!",
    },
    {
      author: "Sarah Wilson",
      comment:
        "My family can use one. DM me if it is still available. Thank you!",
    },
  ];

  // Handle loading, showerr, or missing gift
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "200px" }}
      >
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }
  if (showerr)
    return <div className="alert alert-danger">Error: {showerr}</div>;
  if (!gift) return <div>Gift not found</div>;

  return (
    <div className="container mt-5">
      {/* Back button */}
      <button className="btn btn-secondary mb-3" onClick={handleBackClick}>
        Back
      </button>

      {/* Gift details card */}
      <div className="card product-details-card">
        <div className="card-header text-white">
          <h2 className="details-title">{gift.name}</h2>
        </div>
        <div className="card-body">
          {/* Gift image */}
          <div className="image-placeholder-large">
            {gift.image ? (
              <img
                src={gift.image}
                alt={gift.name}
                className="product-image-large"
              />
            ) : (
              <div className="no-image-available-large">No Image Available</div>
            )}
          </div>

          {/* Gift details */}
          <p>
            <strong>Category: </strong>
            {gift.category}
          </p>
          <p>
            <strong>Condition: </strong>
            {gift.condition}
          </p>
          <p>
            <strong>Date Added: </strong>
            {gift.date_added
              ? new Date(gift.date_added * 1000).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Age (Years): </strong>
            {gift.age_years}
          </p>
          <p>
            <strong>Description: </strong>
            {gift.description}
          </p>
        </div>
      </div>

      {/* Comments */}
      <div className="comments-section mt-4">
        <h3 className="mb-3">Comments</h3>
        {comments.map((comment, index) => (
          <div key={index} className="card mb-3">
            <div className="card-body">
              <p className="comment-author">
                <strong>{comment.author}:</strong>
              </p>
              <p className="comment-text">{comment.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DetailsPage;
