import RecentlyViewed from '@/components/product/RecentlyViewed';

interface RecentlyViewedTabProps {
  isHindi: boolean;
}

const RecentlyViewedTab = ({ isHindi }: RecentlyViewedTabProps) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isHindi ? 'हाल ही में देखे गए उत्पाद' : 'Recently Viewed Products'}
          </h2>
          <p className="text-slate-500 mt-1">
            {isHindi ? 'उत्पाद जिन्हें आपने हाल ही में देखा है' : 'Product catalog items you browsed recently'}
          </p>
        </div>
      </div>

      <RecentlyViewed limit={10} showClearButton={true} />
    </div>
  );
};

export default RecentlyViewedTab;
