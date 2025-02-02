import listSurahWithJuz from "#/src/constants/daftar-surah-with-juz.json";
import { Header } from "#src/components/custom/header";
import { cn } from "#src/utils/misc";
import { motion, useScroll, useSpring } from "framer-motion";
import { hasMatch } from "fzy.js";
import lodash from "lodash";
import { Minus, Search as SearchIcon } from "lucide-react";
import React, { JSX, useMemo, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";

export async function Loader({}: LoaderFunctionArgs) {
  const data = {
    surat: Object.values(listSurahWithJuz).flat(),
  };

  return data;
}

interface SearchProps<T> {
  data: T[];
  searchKey: (keyof T | string)[]; // String untuk nested key
  query: string;
  render: (filteredData: T[]) => JSX.Element;
}

function SearchHandler<T extends Record<string, any>>({
  data,
  searchKey,
  query,
  render,
}: SearchProps<T>) {
  let list = [...data];

  list = list.filter((s) => {
    const combined = searchKey
      .map((key) => lodash.get(s, key as string, "")) // 🔥 Mendukung nested key
      .join(" ");
    return hasMatch(query, combined);
  });

  list = query !== "" ? list.slice(0, 10) : list;

  return render(list);
}

import { useVirtualizer } from "@tanstack/react-virtual";

export function Component() {
  return (
    <React.Fragment>
      <Header redirectTo="/muslim" title="Susun Kata" />
      <SurahView />
    </React.Fragment>
  );
}

function SurahView() {
  const { surat } = useLoaderData<
    typeof Loader
  >();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const loadingIconRef = React.useRef<SVGSVGElement | null>(null);
  const searchIconRef = React.useRef<SVGSVGElement | null>(null);

  const handleSearch = useMemo(
    () =>
      lodash.debounce((value: string) => {
        setQuery(value);
        loadingIconRef.current?.classList.add("hidden");
        searchIconRef.current?.classList.remove("hidden");
      }, 300),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadingIconRef.current?.classList.remove("hidden");
    searchIconRef.current?.classList.add("hidden");
    setInput(e.target.value);
    handleSearch(e.target.value);
  };

  const data_surat = surat;
  const data_placeholder = "Cari Surat..";

  return (
    <>
      <div className="surah-index relative pb-1">
        <input
          id="input-26"
          className="h-10 peer pe-9 ps-9 outline-hidden focus-visible:bg-muted/30 border-b w-full text-sm p-3 bg-background"
          placeholder={data_placeholder}
          type="search"
          value={input}
          onChange={handleInputChange}
        />
        <SearchIcon
          ref={searchIconRef}
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute inset-y-3 start-3 peer-focus:rotate-90 text-muted-foreground/80 peer-disabled:opacity-50 duration-300"
        />
        <svg
          id="loading-icon"
          ref={loadingIconRef}
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="hidden m-1 animate-spin text-foreground pointer-events-none absolute inset-y-2 start-2"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.90321 7.29677C1.90321 10.341 4.11041 12.4147 6.58893 12.8439C6.87255 12.893 7.06266 13.1627 7.01355 13.4464C6.96444 13.73 6.69471 13.9201 6.41109 13.871C3.49942 13.3668 0.86084 10.9127 0.86084 7.29677C0.860839 5.76009 1.55996 4.55245 2.37639 3.63377C2.96124 2.97568 3.63034 2.44135 4.16846 2.03202L2.53205 2.03202C2.25591 2.03202 2.03205 1.80816 2.03205 1.53202C2.03205 1.25588 2.25591 1.03202 2.53205 1.03202L5.53205 1.03202C5.80819 1.03202 6.03205 1.25588 6.03205 1.53202L6.03205 4.53202C6.03205 4.80816 5.80819 5.03202 5.53205 5.03202C5.25591 5.03202 5.03205 4.80816 5.03205 4.53202L5.03205 2.68645L5.03054 2.68759L5.03045 2.68766L5.03044 2.68767L5.03043 2.68767C4.45896 3.11868 3.76059 3.64538 3.15554 4.3262C2.44102 5.13021 1.90321 6.10154 1.90321 7.29677ZM13.0109 7.70321C13.0109 4.69115 10.8505 2.6296 8.40384 2.17029C8.12093 2.11718 7.93465 1.84479 7.98776 1.56188C8.04087 1.27898 8.31326 1.0927 8.59616 1.14581C11.4704 1.68541 14.0532 4.12605 14.0532 7.70321C14.0532 9.23988 13.3541 10.4475 12.5377 11.3662C11.9528 12.0243 11.2837 12.5586 10.7456 12.968L12.3821 12.968C12.6582 12.968 12.8821 13.1918 12.8821 13.468C12.8821 13.7441 12.6582 13.968 12.3821 13.968L9.38205 13.968C9.10591 13.968 8.88205 13.7441 8.88205 13.468L8.88205 10.468C8.88205 10.1918 9.10591 9.96796 9.38205 9.96796C9.65819 9.96796 9.88205 10.1918 9.88205 10.468L9.88205 12.3135L9.88362 12.3123C10.4551 11.8813 11.1535 11.3546 11.7585 10.6738C12.4731 9.86976 13.0109 8.89844 13.0109 7.70321Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <SearchHandler
        data={data_surat}
        searchKey={["s.i", "s.n"]}
        query={query}
        render={(filteredData) => {
          if (filteredData.length > 0) {
            return (
              <VirtualizedListSurahJuz
                items={filteredData}
              />
            );
          } else {
            return (
              <div className="py-6 text-center text-sm h-[calc(100vh-290px)] border-b flex items-center justify-center">
                Surat tidak ditemukan.
              </div>
            );
          }
        }}
      />
    </>
  );
}

function getTotalHeight() {
  // Seleksi semua elemen dengan class 'surah-index'
  const elements = document.querySelectorAll(".surah-index");

  // Jika tidak ada elemen ditemukan, kembalikan 0
  if (elements.length === 0) {
    return 0;
  }

  // Hitung total tinggi elemen-elemen
  let totalHeight = 0;
  for (const element of elements) {
    if (element instanceof HTMLDivElement) { // Memastikan elemen adalah HTMLDivElement
      totalHeight += element.offsetHeight;
    }
  }

  return totalHeight + 55;
}

const VirtualizedListSurahJuz: React.FC<
  {
    items: any[];
  }
> = (
  { items },
) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 62, // Perkiraan tinggi item (70px)
  });

  const { scrollYProgress } = useScroll({
    container: parentRef,
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <React.Fragment>
      <motion.div
        className="z-60 bg-primary  max-w-xl mx-auto"
        style={{
          scaleX,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2.5,
          originX: 0,
        }}
      />
      <div
        ref={parentRef}
        className="border-b"
        style={{
          height: `calc(100vh - ${getTotalHeight()}px)`,
          overflow: "auto",
        }}
      >
        <div
          className="divide-y"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index];
            const s = item?.s;
            const j = item?.j;
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className="first:border-t group"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {j && (
                  <Link
                    to={`/muslim/quran-word-by-word/${j.p}`}
                    className={cn(
                      "text-sm font-semibold py-3 px-4 flex items-center justify-between gap-x-3 text-primary/70 bg-gradient-to-r from-muted via-muted/80 to-muted/50 hover:bg-muted hover:text-primary",
                      s && "border-b",
                    )}
                  >
                    <span>
                      {j.n}
                    </span>
                    <span className="font-normal text-primary">
                      {j.p}
                    </span>
                  </Link>
                )}
                {s && (
                  <Link
                    to={`/muslim/quran-word-by-word/${s.p}?surah=${s.i}&ayah=1`}
                    className="py-1.5 pr-4 pl-3 flex-1 flex items-center justify-between bg-gradient-to-r from-background  to-muted/30 hover:bg-muted hover:bg-muted group"
                  >
                    <div className="flex items-center gap-x-3">
                      <div className="text-2xl font-medium text-center min-w-10 h-10 flex items-center justify-center text-muted-foreground group-hover:text-primary">
                        {s.i}
                      </div>
                      <div className="truncate -space-y-2">
                        <div className="flex text-sm items-center">
                          <p className="font-medium">
                            Surah {s.n}
                          </p>
                        </div>
                        <div className="mt-2 flex truncate">
                          <span className="flex-shrink-0 text-muted-foreground text-sm">
                            {s.r}
                          </span>
                          <Minus className="mx-1 w-2 scale-150" />
                          <span className="flex-shrink-0 text-muted-foreground text-sm">
                            {s.v} ayat
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-sm">
                      {s.p}
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};
