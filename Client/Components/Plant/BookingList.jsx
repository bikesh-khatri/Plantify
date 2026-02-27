import { useEffect, useState } from "react";
import { Check, X, User as UserIcon } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const BASE = "http://localhost:5001";

function CustomerModal({ customer, onClose }) {
  if (!customer) return null;
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xs text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
          <X size={16} />
        </button>
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-2xl uppercase border-4 border-white shadow-lg mx-auto mb-4">
          {customer.fullName?.charAt(0) || <UserIcon size={28} />}
        </div>
        <h2 className="text-lg font-black text-gray-900 mb-1">{customer.fullName}</h2>
        <p className="text-sm text-gray-500 font-bold">{customer.email}</p>
        <p className="text-sm text-gray-400 font-bold mt-0.5">{customer.phone}</p>
        <span className="inline-block mt-4 bg-gray-100 text-gray-500 text-[10px] font-black uppercase px-3 py-1 rounded-full">
          Customer
        </span>
      </div>
    </div>
  );
}

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/api/bookings/nursery-requests");
      setBookings(res.data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatus = async (bookingId, status) => {
    try {
      const res = await api.patch(`/api/bookings/status/${bookingId}`, { status });
      toast.success(`Booking ${status}!`);

      // Real-time stock update on accept
      setBookings(prev => prev.map(b => {
        if (b.id !== bookingId) return b;
        const updated = { ...b, status };
        if (status === "accepted" && res.data.updatedQuantity !== undefined) {
          updated.Plant = { ...b.Plant, quantity: res.data.updatedQuantity };
        }
        return updated;
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating status");
    }
  };

  if (loading) return (
    <div className="text-center py-20 font-black text-green-600 animate-pulse">Loading bookings...</div>
  );

  if (bookings.length === 0) return (
    <div className="py-20 border-2 border-dashed border-gray-100 rounded-3xl text-center">
      <p className="text-gray-300 font-black uppercase tracking-widest text-sm">No booking requests yet</p>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[750px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Customer</th>
                <th className="px-5 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Plant</th>
                <th className="px-5 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Qty</th>
                <th className="px-5 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Price</th>
                <th className="px-5 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Total</th>
                <th className="px-5 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Status</th>
                <th className="px-5 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((booking) => {
                const qty = booking.quantity || 1;
                const price = booking.Plant?.price || 0;
                const total = qty * price;

                return (
                  <tr key={booking.id} className="hover:bg-green-50/20 transition-colors">

                    {/* Customer - click opens modal */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedCustomer(booking.User)}
                        className="flex items-center gap-3 hover:opacity-75 transition-opacity text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-sm uppercase flex-shrink-0 border-2 border-white shadow-sm">
                          {booking.User?.fullName?.charAt(0) || <UserIcon size={14} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm hover:text-green-600 transition-colors">
                            {booking.User?.fullName}
                          </p>
                          <p className="text-[10px] text-gray-400">{booking.User?.email}</p>
                        </div>
                      </button>
                    </td>

                    {/* Plant */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={`${BASE}/${booking.Plant?.image}`}
                          className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                          alt={booking.Plant?.name}
                          onError={(e) => { e.target.src = "/Icons/placeholder.jpg"; }}
                        />
                        <p className="font-bold text-gray-800 text-sm">{booking.Plant?.name}</p>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="px-5 py-4">
                      <span className="font-black text-gray-800">{qty}</span>
                    </td>

                    {/* Price per unit */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-500 text-sm">NPR {price}</span>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-4">
                      <span className="font-black text-green-600">NPR {total}</span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        booking.status === "pending" ? "bg-orange-100 text-orange-600" :
                        booking.status === "accepted" ? "bg-green-100 text-green-600" :
                        "bg-red-100 text-red-600"
                      }`}>
                        {booking.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      {booking.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleStatus(booking.id, "accepted")}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            title="Accept"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            onClick={() => handleStatus(booking.id, "rejected")}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Reject"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <CustomerModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </>
  );
}