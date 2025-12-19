// const Cart=()=>{
    
type AddToCartButtonProps = {
  productId: number;
  onAdd: (id: number) => void;
};

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId, onAdd }) => {
  return (
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      onClick={() => onAdd(productId)}
    >
      Add to Cart
    </button>
  );
};


export default AddToCartButton;