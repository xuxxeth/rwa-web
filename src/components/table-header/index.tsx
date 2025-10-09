import { useTranslation } from "@/hooks/useTranslation";
import { SortButton } from "@/components/sort-button-svg";
import { cn } from "@/utils";
import { type Sort } from "@/hooks/useTableHelper";

function TableHeader<SortableField extends string>({
  lngPrefix = "",
  sort,
  onSortChange,
  config,
  className,
}: {
  lngPrefix?: string;
  className?: string;
  config: {
    key: string;
    sortable: boolean;
  }[];
  sort: Sort | null;
  onSortChange: (field: SortableField) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex px-4 mt-4 flex-row h-12 border-t border-b border-white/10",
        className
      )}
    >
      {config.map(({ key, sortable }) => {
        const order = sort?.field === key ? sort.order : undefined;
        return (
          <div
            key={key}
            className="flex-1 flex flex-row items-center justify-center text-white/60 text-sm/11.5 font-medium py-3"
          >
            <button
              className="cursor-pointer flex flex-row items-center"
              onClick={() => {
                onSortChange(key as SortableField);
              }}
            >
              <span className="mr-0.5 text-sm/3.5 font-medium">
                {t(`${lngPrefix}.${key}`)}
              </span>
              {sortable && (
                <div className="w-4 h-4 flex justify-center flex-row items-center">
                  <SortButton order={order} />
                </div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default TableHeader;
