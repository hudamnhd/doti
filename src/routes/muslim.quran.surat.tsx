import { Header } from '#src/components/custom/header';
import { ScrollToFirstIndex } from '#src/components/custom/scroll-to-top.tsx';
import { Badge } from '#src/components/ui/badge';
import { Button, buttonVariants } from '#src/components/ui/button';
import { Label } from '#src/components/ui/label';
import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
} from '#src/components/ui/popover';
import { get_cache, set_cache } from '#src/utils/cache-client.ts';
import { cn } from '#src/utils/misc';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import ky from 'ky';
import React from 'react';
import {
  Slider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from 'react-aria-components';
import type { SliderProps } from 'react-aria-components';
import {
  Link,
  useLoaderData,
  useRouteLoaderData,
  useSearchParams,
} from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import type { Loader as muslimLoader } from './muslim.data';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export type Ayah = {
  number: string;
  name: string;
  name_latin: string;
  number_of_ayah: string;
  text: { [key: string]: string };
  translations: {
    id: {
      name: string;
      text: { [key: string]: string };
    };
  };
  tafsir: {
    id: {
      kemenag: {
        name: string;
        source: string;
        text: { [key: string]: string };
      };
    };
  };
};

type Surah = Record<string, Ayah>; // Object with dynamic string keys

export async function Loader({ params }: LoaderFunctionArgs) {
  const api = ky.create({
    prefixUrl:
      'https://raw.githubusercontent.com/rioastamal/quran-json/refs/heads/master/surah',
  });

  const { id } = params;
  const surah_number = id;

  if (!surah_number) {
    throw new Response('Not Found', { status: 404 });
  }

  const CACHE_KEY = `/muslim/quran/${id}`;
  const cached_data = await get_cache(CACHE_KEY);

  if (cached_data) return cached_data;
  const surah_data = await api.get(`${surah_number}.json`).json<Surah>();

  const parse = Object.values(surah_data);
  const ayah = parse[0];

  if (!ayah) {
    throw new Response('Not Found', { status: 404 });
  }

  const data = {
    ...ayah,
  };

  await set_cache(CACHE_KEY, data);
  return data;

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; utf-8',
    },
  });
}

interface MySliderProps<T> extends SliderProps<T> {
  label?: string;
  thumbLabels?: string[];
}

function MySlider<T extends number | number[]>({
  label,
  thumbLabels,
  ...props
}: MySliderProps<T>) {
  return (
    <Slider {...props}>
      {label && <Label>{label}</Label>}
      <SliderOutput className='text-sm text-right flex justify-center'>
        {({ state }) =>
          state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}
      </SliderOutput>
      <SliderTrack className='relative w-full h-2 bg-primary/20 rounded mt-2 px-2'>
        {({ state }) => {
          const thumb1Percent = state.getThumbPercent(0) * 100;
          const thumb2Percent = state.getThumbPercent(1) * 100;

          return (
            <>
              {/* Fill */}
              <div
                className='absolute h-full bg-primary rounded-full'
                style={{
                  left: `${Math.min(thumb1Percent, thumb2Percent)}%`,
                  width: `${Math.abs(thumb2Percent - thumb1Percent)}%`,
                }}
              />
              {/* Thumbs */}
              {state.values.map((_, i) => (
                <SliderThumb
                  key={i}
                  index={i}
                  className='absolute w-3 h-3 bg-background ring-2 ring-primary rounded transform -translate-y-1/2 top-2.5'
                  aria-label={thumbLabels?.[i]}
                />
              ))}
            </>
          );
        }}
      </SliderTrack>
    </Slider>
  );
}

import { JollyNumberFieldV2 } from '#src/components/ui/number-field';
import { save_bookmarks } from '#src/utils/bookmarks';
import type { AyatBookmark } from '#src/utils/bookmarks';
import {
  ArrowUpDown,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CornerUpRight,
  Dot,
  Ellipsis,
  Star,
} from 'lucide-react';

export type Ayat = {
  number: string;
  name: string;
  name_latin: string;
  number_of_ayah: string;
  text: { [key: string]: string };
  translations: {
    id: {
      name: string;
      text: { [key: string]: string };
    };
  };
  tafsir: {
    id: {
      kemenag: {
        name: string;
        source: string;
        text: { [key: string]: string };
      };
    };
  };
};

const BOOKMARK_KEY = 'BOOKMARK';
const LASTREAD_KEY = 'LASTREAD';
const LASTREADSURAH_KEY = 'LASTREADSURAH';
const FAVORITESURAH_KEY = 'FAVORITESURAH';

import { fontSizeOpt } from '#/src/constants/prefs';

import { Menu, MenuItem, MenuTrigger } from 'react-aria-components';
import type { MenuItemProps } from 'react-aria-components';

function ActionItem(props: MenuItemProps) {
  return (
    <MenuItem
      {...props}
      className='bg-background relative flex gap-1 select-none items-center rounded-sm px-2 py-1.5 outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-sm'
    />
  );
}

// Fungsi untuk mengonversi angka ke format Arab
const toArabicNumber = (number: number) => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return number
    .toString()
    .split('')
    .map((digit) => arabicDigits[parseInt(digit)])
    .join('');
};

import { useVirtualizer } from '@tanstack/react-virtual';

const saveFavoriteSurah = async (data: any) => {
  const savedData = await get_cache(FAVORITESURAH_KEY) || [];

  // Tambahkan atau perbarui key `id` dengan objek baru
  const updatedData = !savedData.includes(data)
    ? [...savedData, data]
    : savedData.filter((currentId: string) => currentId !== data);
  await set_cache(FAVORITESURAH_KEY, updatedData);
};

const saveLastReadSurah = async (data: any) => {
  const savedData = await get_cache(LASTREADSURAH_KEY) || {};

  // Tambahkan atau perbarui key `id` dengan objek baru
  const updatedData = {
    ...savedData, // salin data lama
    ...data, // tambahkan atau perbarui data baru
  };
  await set_cache(LASTREADSURAH_KEY, updatedData);
};

function ButtonStar() {
  const surat = useLoaderData();
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    const checkFavoriteSurah = async (data: any) => {
      const savedDataFavorite = await get_cache(FAVORITESURAH_KEY) || [];
      setIsFavorite(savedDataFavorite.includes(data));
    };

    checkFavoriteSurah(surat.number);
  }, []);

  return (
    <Button
      variant='ghost'
      title={isFavorite
        ? 'Hapus dari daftar favorit'
        : 'Tambahkan ke daftar favorit'}
      onPress={() => {
        saveFavoriteSurah(surat.number);
        setIsFavorite(!isFavorite);
      }}
      className='[&_svg]:size-4'
      size='icon'
    >
      <Star
        className={cn(
          isFavorite
            ? 'text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400'
            : '',
        )}
      >
        <title>Surat Favorit</title>
      </Star>
    </Button>
  );
}

export function Component() {
  const surat = useLoaderData();

  React.useEffect(() => {
    const obj = {
      [surat.number]: {
        created_at: new Date().toISOString(),
      },
    };

    saveLastReadSurah(obj);
  }, []);

  return (
    <React.Fragment>
      <VirtualizedListSurah>
        <div className='text-3xl font-bold md:text-4xl w-fit mx-auto text-primary pb-3 pt-1 text-center'>
          {surat.name_latin}
          <span className='ml-2 underline-offset-4 group-hover:underline font-lpmq'>
            ( {surat.name} )
          </span>
          <div className='flex items-center text-sm font-medium justify-center -mt-3'>
            <span className=''>{surat.translations.id?.name}</span>
            <Dot className='sm:inline-flex hidden' />
            <span className='sm:inline-flex hidden'>
              Surat ke- {surat.number}
            </span>
            <Dot />
            <span>{surat.number_of_ayah} Ayat</span>
          </div>
        </div>

        <div className='ml-auto flex items-center justify-center gap-3 py-5 '>
          <Link
            className={cn(
              buttonVariants({ size: 'icon', variant: 'outline' }),
            )}
            title='Surat sebelumnya'
            to={parseInt(surat?.number as string) === 1
              ? '#'
              : `/muslim/quran/${parseInt(surat?.number as string) - 1}`}
          >
            <span className='sr-only'>Go to previous page</span>
            <ChevronLeft />
          </Link>

          <span className='text-accent-foreground text-sm'>
            Surat <strong>{surat?.number}</strong> dari <strong>114</strong>
          </span>
          <Link
            className={cn(
              buttonVariants({ size: 'icon', variant: 'outline' }),
            )}
            title='Surat selanjutnya'
            to={parseInt(surat?.number as string) === 114
              ? '#'
              : `/muslim/quran/${parseInt(surat?.number as string) + 1}`}
          >
            <span className='sr-only'>Go to next page</span>
            <ChevronRight />
          </Link>
        </div>
      </VirtualizedListSurah>
    </React.Fragment>
  );
}

import { motion, useScroll, useSpring } from 'framer-motion';

const VirtualizedListSurah = ({ children }: { children: React.ReactNode }) => {
  const [children1, children2] = React.Children.toArray(children);
  const surat = useLoaderData();
  const datas = Object.keys(surat.text); // Mendapatkan list nomor ayat

  const [searchParams, setSearchParams] = useSearchParams();
  const [range_ayat, set_range_ayat] = React.useState({
    start: 0,
    end: datas.length + 1,
  });

  const ayat = searchParams.get('ayat');
  const items = datas.slice(range_ayat.start, range_ayat.end); // Mendapatkan list nomor ayat
  const parentRef = React.useRef<HTMLDivElement>(null);
  const toAyatRef = React.useRef<number>(1);

  // Gunakan useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 56, // Perkiraan tinggi item (70px)
  });

  const parentLoader = useRouteLoaderData<typeof muslimLoader>('muslim');
  const opts = parentLoader?.opts;
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1]; // Ambil item terakhir
  const lastItemBottom = lastItem ? lastItem.start + lastItem.size : 0; // Posisi akhir item terakhir

  const { scrollYProgress } = useScroll({
    container: parentRef,
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [lastRead, setLastRead] = React.useState<any | null>(
    parentLoader?.lastRead || null,
  );
  const [bookmarks, setBookmarks] = React.useState<AyatBookmark[]>(
    parentLoader?.bookmarks || [],
  );

  React.useEffect(() => {
    const load_bookmark_from_lf = async () => {
      const storedBookmarks = await get_cache(BOOKMARK_KEY);
      const storedLastRead = await get_cache(LASTREAD_KEY);
      if (storedLastRead !== null) {
        setLastRead(storedLastRead);
      }
      if (storedBookmarks) {
        setBookmarks(storedBookmarks);
      }

      if (ayat !== null) {
        scrollToAyat(parseInt(ayat) - 1);
      }
    };
    // load_bookmark_from_lf();

    if (ayat !== null) {
      sleep(50).then(() => scrollToAyat(parseInt(ayat) - 1));
    }
  }, []);

  React.useEffect(() => {
    set_range_ayat({
      start: 0,
      end: datas.length + 1,
    });
  }, [datas.length]);

  const bookmarks_ayah = bookmarks
    .filter((item) => item.type === 'ayat') // Hanya ambil item dengan type "ayat"
    .map((item) => {
      const params = new URLSearchParams(item.source.split('?')[1]); // Ambil query string setelah "?"
      return {
        created_at: item.created_at,
        id: params.get('ayat'),
      }; // Ambil nilai "ayat"
    });

  const save_bookmark_to_lf = async (bookmarks: AyatBookmark[]) => {
    await set_cache(BOOKMARK_KEY, bookmarks);
  };
  // Fungsi untuk toggle favorit
  const toggleBookmark = (key: string) => {
    const data_bookmark = {
      id: `${surat.number}:${key}`,
      title: `${surat.name_latin}:${key}`,
      arab: surat.text[key],
      latin: '',
      tafsir: {
        source: surat.tafsir.id.kemenag.source,
        text: surat.tafsir.id.kemenag.text[key],
      },
      translation: surat.translations.id.text[key],
      source: `/muslim/quran/${surat.number}?ayat=${key}`,
    };
    const newBookmarks = save_bookmarks('ayat', data_bookmark, [...bookmarks]);

    const is_saved = bookmarks_ayah.find((fav) => fav.id === key);

    if (is_saved) {
      const _newBookmarks = bookmarks?.filter(
        (d) => d.created_at !== is_saved.created_at,
      );
      setBookmarks(_newBookmarks);

      save_bookmark_to_lf(_newBookmarks);
    } else {
      setBookmarks(newBookmarks);
      save_bookmark_to_lf(newBookmarks);
    }
  };

  const saveLastRead = async (lastRead: any) => {
    await set_cache(LASTREAD_KEY, lastRead);
  };
  // Tandai ayat sebagai terakhir dibaca
  const handleRead = (key: string) => {
    const id = `${surat.number}-${key}`;
    const data_bookmark = {
      id,
      title: `${surat.name_latin}:${key}`,
      arab: surat.text[key],
      latin: '',
      tafsir: {
        source: surat.tafsir.id.kemenag.source,
        text: surat.tafsir.id.kemenag.text[key],
      },
      translation: surat.translations.id.text[key],
      source: `/muslim/quran/${surat.number}?ayat=${key}`,
      created_at: new Date().toISOString(),
    };
    const isLastRead = lastRead?.id === id;
    if (isLastRead) {
      setLastRead(null);
      saveLastRead(null);
    } else {
      setLastRead(data_bookmark);
      saveLastRead(data_bookmark);
    }
  };

  const scrollToAyat = (index: number) => {
    rowVirtualizer.scrollToIndex(index, {
      align: 'start',
    });
  };

  const scrollToFirstAyat = () => {
    rowVirtualizer.scrollToIndex(0, {
      align: 'center',
    });
  };

  const relativeTime = lastRead
    ? formatDistanceToNow(new Date(lastRead.created_at), {
      addSuffix: true,
      includeSeconds: true,
      locale: id,
    })
    : null;

  const maxValue = datas.length;
  const title = `${surat.number}. ${surat.name_latin}`;
  return (
    <React.Fragment>
      <motion.div
        className='z-60 bg-linear-to-r from-fuchsia-500 to-cyan-500 dark:from-fuchsia-400 dark:to-cyan-400 max-w-xl mx-auto'
        style={{
          scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          originX: 0,
        }}
      />

      <Header redirectTo='/muslim/quran' title={title}>
        <ButtonStar />

        <PopoverTrigger>
          <Button
            variant='ghost'
            size='icon'
            title='Pindah ke ayat'
          >
            <ArrowUpDown />
          </Button>
          <Popover isNonModal={false} placement='bottom'>
            <PopoverDialog className='max-w-[180px] space-y-2.5 bg-background rounded-md'>
              {({ close }) => (
                <React.Fragment>
                  <MySlider
                    onChangeEnd={(v) =>
                      set_range_ayat({
                        start: v[0] - 1,
                        end: v[1],
                      })}
                    label='Jumlah Ayat'
                    defaultValue={[range_ayat.start + 1, range_ayat.end + 1]}
                    minValue={1}
                    maxValue={maxValue}
                    thumbLabels={['start', 'end']}
                  />
                  <JollyNumberFieldV2
                    onChange={(value) => {
                      toAyatRef.current = value - 1;
                    }}
                    defaultValue={range_ayat.start + 1}
                    minValue={range_ayat.start + 1}
                    maxValue={range_ayat.end + 1}
                    className='w-full'
                    label='Ke ayat'
                  />
                  <Button
                    className='w-full'
                    onPress={() => {
                      close();
                      scrollToAyat(toAyatRef.current);
                    }}
                  >
                    Submit
                  </Button>
                </React.Fragment>
              )}
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
      </Header>
      <div
        ref={parentRef}
        className='h-[calc(100vh-55px)]'
        style={{
          overflowAnchor: 'none',
          overflow: 'auto',
          position: 'relative',
          contain: 'strict',
        }}
      >
        <div
          className='divide-y'
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {children1 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(0px)`,
                paddingBottom: '1px',
              }}
            >
              {children1}
            </div>
          )}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const key = items[virtualRow.index];
            const isFavorite = bookmarks_ayah.some((fav) => fav.id === key);
            const id = `${surat.number}-${key}`;
            const isLastRead = lastRead?.id === id;

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${
                    virtualRow.start + (children ? 97 : 0)
                  }px)`, // Tambahkan offset untuk children
                }}
              >
                <div
                  id={'quran' + surat.number + key}
                  key={key}
                  className='group relative p-3 mb-3'
                >
                  <div className='absolute flex justify-between w-full -translate-y-7 items-center max-w-[95%] mx-auto'>
                    <div className='w-1/4'>
                      <Badge
                        className='rounded-md bg-background w-fit'
                        variant='outline'
                      >
                        Ayat {key}
                      </Badge>
                    </div>
                    <div className='w-2/4 flex items-center justify-center'>
                      {isLastRead
                        ? (
                          <div
                            className={cn(
                              buttonVariants({ variant: 'outline' }),
                              'h-8 px-2 text-xs gap-1 mx-auto',
                            )}
                          >
                            <Bookmark
                              className={cn(
                                'fill-blue-500 text-blue-500 dark:text-blue-400 dark:fill-blue-400',
                              )}
                            />
                            <span className='truncate max-w-[135px]'>
                              {relativeTime}
                            </span>
                          </div>
                        )
                        : <div />}
                    </div>

                    <div className='flex items-center gap-x-1 justify-end w-1/4'>
                      {isFavorite && (
                        <Button
                          onPress={() => toggleBookmark(key)}
                          aria-label='Menu'
                          variant='outline'
                          size='icon'
                          className={cn('h-8 w-8')}
                          title='Hapus bookmark'
                        >
                          <Star
                            className={cn(
                              'fill-orange-500 text-orange-500 dark:text-orange-400 dark:fill-orange-400',
                            )}
                          />
                        </Button>
                      )}
                      <MenuTrigger>
                        <Button
                          aria-label='Menu'
                          variant='outline'
                          size='icon'
                          className={cn('h-8 w-8')}
                          title={`Menu ayat ${key}`}
                        >
                          <Ellipsis />
                        </Button>
                        <Popover
                          placement='left'
                          className=' bg-background p-1 w-44 overflow-auto rounded-md shadow-lg entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95 fill-mode-forwards origin-top-left'
                        >
                          <div className='px-2 py-1.5 text-sm font-semibold border-b mb-1'>
                            {surat.name_latin} - Ayat {key}
                            {' '}
                          </div>
                          <Menu className='outline-hidden'>
                            <ActionItem
                              id='new'
                              onAction={() => toggleBookmark(key)}
                            >
                              <Star
                                className={cn(
                                  'mr-1 size-3',
                                  isFavorite &&
                                    'fill-orange-500 text-orange-500 dark:text-orange-400 dark:fill-orange-400',
                                )}
                              />
                              Bookmark
                            </ActionItem>
                            <ActionItem
                              id='open'
                              onAction={() => handleRead(key)}
                            >
                              <Bookmark
                                className={cn(
                                  'mr-1 w-4 h-4',
                                  isLastRead && 'fill-blue-500 text-blue-500',
                                )}
                              />
                              Terakhir Baca
                            </ActionItem>
                          </Menu>
                        </Popover>
                      </MenuTrigger>
                    </div>
                  </div>
                  <div dir='rtl' className='break-normal pr-2.5'>
                    <div
                      className={cn(
                        'text-primary my-3 font-lpmq',
                        opts?.font_type,
                      )}
                      style={{
                        fontWeight: opts?.font_weight,
                        fontSize: font_size_opts?.fontSize || '1.5rem',
                        lineHeight: font_size_opts?.lineHeight || '3.5rem',
                      }}
                    >
                      {surat.text[key]}
                      <span
                        className={cn(
                          'text-4xl inline-flex mx-1 font-uthmani',
                          opts?.font_type === 'font-indopak-2' && 'mr-5',
                        )}
                      >
                        {toArabicNumber(Number(key))}
                      </span>
                      {' '}
                    </div>
                  </div>

                  {opts?.font_translation === 'on' && (
                    <div className='max-w-none prose prose-base dark:prose-invert whitespace-pre-wrap mb-2'>
                      {surat.translations.id.text[key]}
                    </div>
                  )}

                  {opts?.font_tafsir === 'on' && (
                    <details className='group [&_summary::-webkit-details-marker]:hidden'>
                      <summary className='flex cursor-pointer items-center gap-1.5 outline-hidden'>
                        <div className='group-open:animate-slide-left [animation-fill-mode:backwards] group-open:block hidden font-medium text-sm text-indigo-600 dark:text-indigo-400'>
                          Tafsir {surat.name_latin}:{key}
                          {' '}
                        </div>
                        <div className='animate-slide-left group-open:hidden font-medium text-sm text-indigo-600 dark:text-indigo-400'>
                          Tafsir {surat.name_latin}:{key}
                          {' '}
                        </div>

                        <svg
                          className='size-4 shrink-0 transition duration-300 group-open:-rotate-180 text-indigo-600 dark:text-indigo-400 opacity-80'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </summary>

                      <div className='group-open:animate-slide-left group-open:[animation-fill-mode:backwards] group-open:transition-all group-open:duration-300'>
                        <div className='max-w-none prose-lg my-2.5 font-semibold whitespace-pre-wrap text-accent-foreground border-b'>
                          Tafsir {surat.name_latin}:{key}
                          {' '}
                        </div>
                        <p className='max-w-none prose prose-base dark:prose-invert whitespace-pre-wrap'>
                          {surat.tafsir.id.kemenag.text[key]}
                        </p>
                        {/*<TafsirText text={surat.tafsir.id.kemenag.text[key]} />*/}
                        <div className='text-muted-foreground text-xs prose-xs'>
                          Sumber:
                          <br />
                          {surat.tafsir.id.kemenag.source}
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            );
          })}

          {children2 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${
                  lastItemBottom + (children2 ? 93 : 0)
                }px)`, // Tambahkan offset untuk children
                paddingBottom: '15px',
              }}
            >
              {children2}
            </div>
          )}
        </div>
      </div>
      <ScrollToFirstIndex handler={scrollToFirstAyat} container={parentRef} />
    </React.Fragment>
  );
};
