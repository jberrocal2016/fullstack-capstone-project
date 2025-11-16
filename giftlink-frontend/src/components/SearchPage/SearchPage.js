import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { urlConfig } from "../../config";

function SearchPage() {
  // State for search inputs and results
  const [searchQuery, setSearchQuery] = useState("");
  const [ageRange, setAgeRange] = useState(6); // Initialize with minimum value
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dropdown options
  const categories = ["Living", "Bedroom", "Bathroom", "Kitchen", "Office"];
  const conditions = ["New", "Like New", "Older"];

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all products initially
    const fetchProducts = async () => {
      try {
        const url = `${urlConfig.backendUrl}/api/gifts`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error; ${response.status}`);
        }
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch search results based on filters
  const handleSearch = async () => {
    setLoading(true);
    const baseUrl = `${urlConfig.backendUrl}/api/search?`;
    const queryParams = new URLSearchParams({
      name: searchQuery,
      age_years: ageRange,
      category,
      condition,
    }).toString();

    try {
      const response = await fetch(`${baseUrl}${queryParams}`);
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to details page for a selected gift
  const goToDetailsPage = (productId) => {
    navigate(`/app/product/${productId}`);
  };

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          {/* Filter section */}
          <div className="filter-section mb-3 p-3 border rounded">
            <h5>Filters</h5>
            <div className="d-flex flex-column">
              {/* Category dropdown */}
              <label htmlFor="categorySelect">Category</label>
              <select
                id="categorySelect"
                className="form-control my-1"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Condition dropdown */}
              <label htmlFor="conditionSelect">Condition</label>
              <select
                id="conditionSelect"
                className="form-control my-1"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="">All</option>
                {conditions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Age range slider */}
              <label htmlFor="ageRange">Less than {ageRange} years</label>
              <input
                type="range"
                className="form-control-range"
                id="ageRange"
                min="1"
                max="10"
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
              />
            </div>
          </div>

          {/* Search input */}
          <form
            onSubmit={(e) => {
              e.preventDefault(); // prevent page reload
              handleSearch();
            }}
          >
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Search button */}
            <button type="submit" className="btn btn-primary">
              Search
            </button>{" "}
          </form>

          {/* Search results */}
          <div className="search-results mt-4">
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "100px" }}
              >
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((product) => (
                <div key={product.id} className="card mb-3">
                  {/* Product image */}
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="card-img-top"
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">
                      {product.description
                        ? product.description.slice(0, 100) + "..."
                        : "No description available"}
                    </p>
                  </div>
                  <div className="card-footer">
                    <button
                      onClick={() => goToDetailsPage(product.id)}
                      className="btn btn-primary"
                    >
                      View More
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="alert alert-info" role="alert">
                No products found. Please revise your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
