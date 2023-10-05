import { useParams } from "react-router-dom";

const BookingPage = () => {
  const { id } = useParams();
  return (
    <div>single bookings: {id}</div>
  );
};

export default BookingPage;
