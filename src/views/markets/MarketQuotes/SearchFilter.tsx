import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils'

function SearchFilter({
  isFavorites,
  onFavoriteChange,
  searchText,
  onSearchChange,
}: {
  isFavorites: boolean
  searchText: string
  onSearchChange: (text: string) => void
  onFavoriteChange: (isFavorites: boolean) => void
}) {
  const { t } = useTranslation()
  return (
    <div className='flex flex-row my-2 gap-2'>
      <div
        className={cn(
          'flex flex-row gap-1 text-sm/4.5 p-1 cursor-pointer border border-gray-850 rounded-[8px] font-medium text-gray-400'
        )}
      >
        <div
          onClick={() => onFavoriteChange(false)}
          className={cn('px-3 py-1.5 rounded-[6px]', !isFavorites ? 'text-white bg-gray-750 ' : '')}
        >
          {t('marketQuotes.all')}
        </div>
        <div
          onClick={() => onFavoriteChange(true)}
          className={cn(
            'px-3 py-1.5 rounded-[6px] flex flex-row gap-1 items-center',
            !isFavorites ? 'text-gray-400' : 'bg-gray-750 text-white'
          )}
        >
          <LazyImage
            src={!isFavorites ? '/images/v2/icons/collect.png' : '/images/v2/icons/collected.png'}
            className='w-4 h-4'
          />
          {t('marketQuotes.cl')}
        </div>
      </div>
      <div className='relative'>
        <LazyImage
          src='/images/v2/icons/search.png'
          className='absolute left-2 top-1/2 -translate-y-1/2 w-4.5 h-4.5'
        />
        <input
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
          maxLength={30}
          placeholder={t('marketQuotes.search')}
          className='text-sm/4.5 font-normal h-full text-gray-500 w-[403px] border border-gray-850 rounded-[8px] py-2 pl-7.5 pr-2 outline-none focus:border-[rgba(156,255,58,0.8)] caret-[rgba(156,255,58,0.8)]'
        />
      </div>
    </div>
  )
}
export default SearchFilter
