import { Header } from "#src/components/custom/header";
import type { Loader as muslimLoader } from "./muslim.data";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ScrollToFirstIndex } from "#src/components/custom/scroll-to-top.tsx";
import { Heart } from "lucide-react";
import { useLoaderData, useRouteLoaderData } from "react-router";
import { cn } from "#src/utils/misc";
import { get_cache, set_cache } from "#src/utils/cache-client.ts";

import ky from "ky";
import type { LoaderFunctionArgs } from "react-router";

const BOOKMARK_KEY = "BOOKMARK";

const sumber = [
	"quran",
	"hadits",
	"pilihan",
	"harian",
	"ibadah",
	"haji",
	"lainnya",
];

export type ResponseData = {
	status: boolean;
	request: {
		path: string;
	};
	data: Datum[];
};

export type Datum = {
	arab: string;
	indo: string;
	judul: string;
	source: "quran";
};

export async function Loader({ params }: LoaderFunctionArgs) {
	const { source } = params;

	if (!source) {
		throw new Error("404: Source not found");
	}

	if (!sumber.includes(source)) {
		throw new Error("404: Source not found");
	}

	const CACHE_KEY = `/muslim/doa/${source}`;
	const cached_data = await get_cache(CACHE_KEY);

	if (cached_data) return cached_data;

	const api = ky.create({ prefixUrl: "https://api.myquran.com/v2/doa/sumber" });
	const res = await api.get(source).json<ResponseData>();

	if (!res.status) {
		throw new Response("Not Found", { status: 404 });
	}

	const data = {
		label: res.request.path.replace(/\//g, " ").replace(/sumber/gi, ""), // Ganti '/' dengan spasi
		source: res.request.path.replace(/\//g, " ").trim().split(" ").pop(),
		data: res.data,
	};

	await set_cache(CACHE_KEY, data);
	return data;
}

export function Component() {
	const loaderData = useLoaderData<typeof Loader>();

	return (
		<React.Fragment>
			<Header redirectTo="/muslim/doa" title={`Do'a ${loaderData.source}`} />

			<DoaView>
				<div className="text-center p-2 border-b">
					<div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize">
						Do'a {loaderData.source}
					</div>
					<p className="text-muted-foreground">
						Kumpulan do'a {loaderData.source === "pilihan" ? "" : "dari"}{" "}
						{loaderData.source}
					</p>
				</div>
			</DoaView>
		</React.Fragment>
	);
}

import {
	AyatBookmark,
	save_bookmarks,
	type Bookmark,
} from "#src/utils/bookmarks";

import React from "react";
import { fontSizeOpt } from "#/src/constants/prefs";
import { motion, useSpring, useScroll } from "framer-motion";

const DoaView = ({ children }: { children: React.ReactNode }) => {
	const parentLoader = useRouteLoaderData<typeof muslimLoader>("muslim");
	const opts = parentLoader?.opts;

	const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);
	const { data: items } = useLoaderData<typeof Loader>();
	const parentRef = React.useRef<HTMLDivElement>(null);

	const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);

	React.useEffect(() => {
		const load_bookmark_from_lf = async () => {
			const storedBookmarks = await get_cache(BOOKMARK_KEY);
			if (storedBookmarks) {
				setBookmarks(storedBookmarks);
			}
		};

		load_bookmark_from_lf();
	}, []);

	const bookmarks_ayah = bookmarks
		.filter((item) => item.type === "doa")
		.map((item) => {
			const params = new URLSearchParams(item.source.split("?")[1]);
			return {
				created_at: item.created_at,
				id: params.get("index"),
				source: item.source,
			}; // Ambil nilai "ayat"
		});

	const toggleBookmark = (doa) => {
		const newBookmarks = save_bookmarks(
			"doa",
			{
				title: doa.judul,
				arab: doa.arab,
				translation: doa.indo,
				source: `/muslim/doa?index=${doa.index}&source=${doa.source}`,
			},
			[...bookmarks],
		);

		const is_saved = bookmarks_ayah.find((fav) => fav.id === doa.index);

		if (is_saved) {
			const newBookmarks = bookmarks?.filter(
				(d) => d.created_at !== is_saved.created_at,
			);
			setBookmarks(newBookmarks);
		} else {
			setBookmarks(newBookmarks);
		}
	};

	React.useEffect(() => {
		const save_bookmark_to_lf = async (bookmarks: AyatBookmark[]) => {
			await set_cache(BOOKMARK_KEY, bookmarks);
		};
		save_bookmark_to_lf(bookmarks);
	}, [bookmarks]);

	const rowVirtualizer = useVirtualizer({
		count: items.length, // Jumlah total item
		getScrollElement: () => parentRef.current, // Elemen tempat scrolling
		estimateSize: () => 35,
	});

	const { scrollYProgress } = useScroll({
		container: parentRef,
	});

	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	const scrollToFirstAyat = () => {
		rowVirtualizer.scrollToIndex(0, {
			align: "center",
		});
	};

	return (
		<React.Fragment>
			<motion.div
				className="z-60 bg-linear-to-r from-fuchsia-500 to-cyan-500 dark:from-fuchsia-400 dark:to-cyan-400 max-w-xl mx-auto"
				style={{
					scaleX,
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					height: 5,
					originX: 0,
				}}
			/>
			<div
				ref={parentRef}
				className="h-[calc(100vh-55px)]"
				style={{
					overflowAnchor: "none",
					overflow: "auto",
					position: "relative",
					contain: "strict",
				}}
			>
				<div
					className="py-2"
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						position: "relative",
					}}
				>
					{children && (
						<div
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								transform: `translateY(0px)`,
								paddingBottom: "1px",
							}}
						>
							{children}
						</div>
					)}
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const d = items[virtualRow.index];
						const doa = {
							...d,
							index: virtualRow.index.toString(),
						};

						const _source = `/muslim/doa?index=${doa.index}&source=${doa.source}`;

						const isFavorite = bookmarks_ayah.some(
							(fav) => fav.source === _source,
						);
						return (
							<div
								key={virtualRow.key}
								data-index={virtualRow.index}
								ref={rowVirtualizer.measureElement}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualRow.start + (children ? 79 : 0)}px)`, // Tambahkan offset untuk children
								}}
							>
								<div key={virtualRow.index} className="w-full border-b pb-5">
									<div className="group relative w-full">
										<div
											className={cn(
												"flex items-center justify-between gap-x-2 mb-2 border-b py-2.5 px-4 bg-linear-to-br from-muted/20 to-accent/20",
												isFavorite &&
													"from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20",
											)}
										>
											<div className="text-primary font-medium text-lg line-clamp-1">
												{doa.judul}
											</div>

											<button
												onClick={() => toggleBookmark(doa)}
												className={cn(
													"flex-none  bg-linear-to-br from-muted to-accent size-9 [&_svg]:size-5 inline-flex gap-2 items-center justify-center rounded-lg",
													isFavorite &&
														"from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20",
												)}
											>
												<Heart
													className={cn(
														"text-muted-foreground",
														isFavorite && "text-rose-600 dark:text-rose-400",
													)}
												/>
											</button>
										</div>

										<div className="w-full px-4 text-right flex gap-x-2.5 items-start justify-end">
											<p
												className={cn(
													"relative mt-2 font-lpmq text-right text-primary font-lpmq",
													opts?.font_type,
												)}
												style={{
													fontWeight: opts?.font_weight,
													fontSize: font_size_opts?.fontSize || "1.5rem",
													lineHeight: font_size_opts?.lineHeight || "3.5rem",
												}}
												dangerouslySetInnerHTML={{
													__html: doa.arab,
												}}
											/>
										</div>
										<div className="mt-3 space-y-3 px-4">
											<div
												className="translation-text prose dark:prose-invert leading-6 max-w-none"
												dangerouslySetInnerHTML={{
													__html: doa.indo,
												}}
											/>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
			<ScrollToFirstIndex
				handler={scrollToFirstAyat}
				container={parentRef}
				className="bottom-3"
			/>
		</React.Fragment>
	);
};
