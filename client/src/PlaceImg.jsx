import PropTypes from "prop-types";

const SERVER_URL = `${import.meta.env.VITE_API_BASE_URL}`;

const PlaceImg = ({ place, index = 0, className = null }) => {
  // add propTypes
  PlaceImg.propTypes = {
    place: PropTypes.any,
    index: PropTypes.any,
    className: PropTypes.any,
  };

  if (!place.photos?.length) {
    return "";
  }
  if (!className) {
    className = "object-cover";
  }

  return (
    <img
      className={className}
      src={`${SERVER_URL}/uploads/` + place.photos[index]}
      alt=""
    />
  );
};

export default PlaceImg;
