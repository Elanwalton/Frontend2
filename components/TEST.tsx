import { buildMediaUrl } from '@/utils/media';
import CategorySection from '@/components/CategoriesSection';

export default function HomePag() {
  const banners = [
    {
      image: buildMediaUrl("images/solar-water-pumping-inverters-for-sale-in-nairobi-kenya.webp"),
      link: "/categories",
    },
    {
      image: buildMediaUrl("images/growatt-solar-inverters-1.jpg"),
      link: "/categories",
    },
    {
      image: buildMediaUrl("images/Original-suntree-solar-accessories-in-nairobi-kenya.jpg"),
      link: "/categories",
    },
  ];

  const products = [
    {
      id: 1,
      image: buildMediaUrl("images/BYD-BATTERY-BOX.webp"),
      title: "Solar Lamp Pro",
      price: "$100",
      oldPrice: "$120",
      tag: "HOT",
    },
    {
      id: 2,
      image: buildMediaUrl("images/growatt-solar-inverters-1.jpg"),
      title: "Wall Solar Light",
      price: "$85",
      discount: "-10%",
    },
    {
      id: 3,
      image: buildMediaUrl("images/Original-suntree-solar-accessories-in-nairobi-kenya.jpg"),
      title: "Street Solar Light",
      price: "$150",
      soldInfo: "Sold: 20",
    },
    {
      id: 4,
      image: buildMediaUrl("images/non-pressurized-solar-water-heaters-in-kenya.png"),
      title: "Solar Spike Light",
      price: "$60",
    },
    {
      id: 5,
      image: buildMediaUrl("images/Solar.png"),
      title: "Flood Light 300W",
      price: "$130",
      discount: "-15%",
    },
    {
      id: 6,
      image: buildMediaUrl("images/HeroMantion.jpg"),
      title: "Motion Sensor Light",
      price: "$90",
    },
  ];

  return (
    <main>
      <CategorySection
        title="Solar Outdoor"
        banners={banners}
        products={products}
        viewAllLink="/categories?category=Solar%20Outdoor%20Lights"
      />
    </main>
  );
}
