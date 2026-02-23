export default function PlantCard({ plant, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-gray-100"
    >
      {/* Plant Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={plant.image ? `http://localhost:5001/${plant.image}` : "/placeholder-plant.jpg"}  // FIXED: was 5000
          alt={plant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase text-green-700">
          NPR {plant.price}
        </div>
      </div>

      {/* Plant Info */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-black text-gray-800 text-lg leading-tight">{plant.name}</h3>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
            plant.quantity > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          }`}>
            {plant.quantity > 0 ? `${plant.quantity} In Stock` : "Out of Stock"}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase">{plant.category}</span>
          <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase">{plant.environment}</span>
          <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase">{plant.seasonality}</span>
        </div>
      </div>
    </div>
  );
}