import { ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CATEGORIES, type CategoryId } from "@/config/booking";
import { formatNaira } from "@/lib/format";
import { type } from "@/lib/scale";
import type { Service } from "@/types";
import {
  CalendarBlank,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  SquaresFour,
} from "@phosphor-icons/react/dist/ssr";
import { Fragment } from "react/jsx-runtime";

/**
 * Card photos from Pinterest. To change one, paste a new i.pinimg.com address into `src`.
 * (736x pictures are sharper than 236x ones: replace "236x" with "736x" in the address.)
 * Plain <img> is used so any address works; switch to next/image once these are local files.
 */
export const CATEGORY_PHOTOS: Record<
  CategoryId,
  { title: string; alt: string; src: string }
> = {
  ac: {
    title: "AC servicing",
    alt: "A technician checking a split air conditioner",
    src: "https://i.pinimg.com/1200x/83/ee/bc/83eebc61ee60649d75d03378cab7a23e.jpg",
    // src: "https://i.pinimg.com/736x/9f/9a/bb/9f9abbaafb4e3b2aa466068c4af4955c.jpg",
  },
  electrical: {
    title: "Electrical repairs",
    alt: "An electrician repairing a power socket with pliers",
    src: "https://i.pinimg.com/1200x/83/ab/a3/83aba3d710d42c736fe005b80d2454eb.jpg",
    // src: "https://i.pinimg.com/736x/02/7b/91/027b919d0bdaf61731fc40ba212fdd99.jpg",
  },
  plumbing: {
    title: "Plumbing",
    alt: "A spanner resting on a stainless steel sink",
    src: "https://i.pinimg.com/736x/80/48/2e/80482e472100527ee94ac2e31d2a1cbe.jpg",
  },
  cleaning: {
    title: "Home cleaning",
    alt: "A woman cleaning a home",
    src: "https://i.pinimg.com/1200x/14/ec/3a/14ec3a8a67352493326176676b5d69bd.jpg",
  },
};

/** One card per service category: photo, icon badge, "from" price of its cheapest service, and a booking button. */
export function ServiceCards({ services }: { services: Service[] }) {
  const cards = CATEGORIES.map((c) => {
    const items = services.filter((s) => s.category === c.id);
    const cheapest = items.reduce<Service | null>(
      (min, s) => (!min || s.priceKobo < min.priceKobo ? s : min),
      null,
    );
    return { id: c.id, cheapest, count: items.length };
  }).filter((c) => c.cheapest);

  if (cards.length === 0)
    return (
      <p className={type.body}>
        No services are listed yet. Please check back soon.
      </p>
    );

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl1:gap-5 xl3:gap-7">
      {cards.map(({ id, cheapest, count }) => {
        const photo = CATEGORY_PHOTOS[id];
        return (
          <li
            key={id}
            className="flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card"
          >
            {/* Image */}
            <div className="relative aspect-4/3 shrink-0 overflow-hidden bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Details */}
            <div className="relative z-10 -mt-4 flex flex-1 flex-col rounded-t-xl bg-surface-2 px-4 pb-4 pt-9 xl3:px-5 xl3:pb-5 xl3:pt-11">
              <span className="absolute -top-7 left-2 grid size-10 place-items-center rounded-3xl bg-surface-2 text-brand xl3:left-4 xl3:size-14">
                <CategoryIcon category={id} className="size-5.5 xl3:size-7" />
              </span>

              <h3 className="font-display text-lg font-bold xl1:text-xl xl3:text-2xl">
                {photo.title}
              </h3>
              <div className="">
                {count > 1 && (
                  <span className="mr-1.5 text-xs font-medium text-muted xl1:text-base">
                    from
                  </span>
                )}
                <p className="font-display text-xl font-bold text-brand-dark xl1:text-[1.5rem] xl3:text-3xl">
                  {formatNaira(cheapest!.priceKobo)}
                </p>
              </div>

              <ButtonLink
                href={`/book?service=${cheapest!.slug}`}
                arrow
                className="mt-5 w-full"
              >
                Book service
                <span className="sr-only"> {photo.title}</span>
              </ButtonLink>
            </div>
          </li>

          // <li
          //   key={id}
          //   className="flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card"
          // >
          //   <div className="relative aspect-3/2 overflow-hidden bg-surface-2">
          //     {/* eslint-disable-next-line @next/next/no-img-element */}
          //     <img
          //       src={photo.src}
          //       alt={photo.alt}
          //       loading="lazy"
          //       decoding="async"
          //       className="size-full object-cover transition-transform duration-500 hover:scale-105"
          //     />
          //   </div>
          //   <div className="relative bg-surface-2 flex flex-1 flex-col px-4 pb-4 pt-9 xl3:px-5 xl3:pb-5 xl3:pt-11">
          //     <span className="absolute -top-6 left-4 grid size-12 place-items-center rounded-full bg-white text-brand shadow-[0_2px_10px_rgba(16,24,40,0.15)] xl3:left-5 xl3:size-14">
          //       <CategoryIcon category={id} className="size-6 xl3:size-7" />
          //     </span>
          //     <h3 className="font-display text-lg font-bold xl1:text-xl xl3:text-2xl">
          //       {photo.title}
          //     </h3>
          //     <p className="mt-1.5 font-display text-2xl font-bold text-brand-dark xl1:text-[1.7rem] xl3:text-4xl">
          //       {count > 1 && (
          //         <span className="mr-1.5 text-sm font-medium text-muted xl1:text-base">
          //           from
          //         </span>
          //       )}
          //       {formatNaira(cheapest!.priceKobo)}
          //     </p>
          //     <ButtonLink
          //       href={`/book?service=${cheapest!.slug}`}
          //       arrow
          //       className="mt-5 w-full"
          //     >
          //       Book service
          //       <span className="sr-only"> {photo.title}</span>
          //     </ButtonLink>
          //   </div>
          // </li>
        );
      })}
    </ul>
  );
}

const STEPS = [
  { label: "Choose service", Icon: SquaresFour },
  { label: "Select area & time", Icon: CalendarBlank },
  { label: "Pay securely", Icon: CreditCard },
  { label: "Technician assigned", Icon: CheckCircle },
] as const;

/** The four booking steps as a connected row. */
export function BookingSteps() {
  return (
    <ol
      className="grid grid-cols-2 gap-y-8 md:flex md:items-center md:gap-3 md:pb-10 xl3:gap-5 xl3:pb-14"
      aria-label="How booking works"
    >
      {STEPS.map(({ label, Icon }, i) => {
        const first = i === 0;
        const last = i === STEPS.length - 1;
        return (
          <Fragment key={label}>
            <li className="relative flex min-w-0 flex-col items-center text-center md:block md:shrink-0 md:text-left">
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white xl3:size-11 xl3:text-lg">
                  {i + 1}
                </span>
                <Icon
                  aria-hidden="true"
                  className="size-6 shrink-0 text-brand xl3:size-8"
                />
              </div>
              <p
                className={`mt-2.5 text-sm font-medium text-ink-soft xl1:text-base xl3:text-lg md:absolute md:top-full md:whitespace-nowrap ${
                  first
                    ? "md:left-0"
                    : last
                      ? "md:right-0"
                      : "md:left-1/2 md:-translate-x-1/2"
                }`}
              >
                {label}
              </p>
            </li>
            {!last && (
              <li
                aria-hidden="true"
                role="presentation"
                className="hidden h-px flex-1 bg-line-strong md:block"
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}

/** A sample booking, so visitors can see what they get once a technician is assigned. */
export function SampleBooking({
  photo,
  title,
  area,
  when,
  price,
}: {
  photo: string;
  title: string;
  area: string;
  when: string;
  price: string;
}) {
  return (
    <>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted xl1:text-sm">
        Example booking
      </p>

      <div className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5 xl3:p-7">
        <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-6 xl3:gap-10">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-16 w-32 rounded-lg object-cover xl3:h-20 xl3:w-28"
            />
            <div className="sm:hidden">
              <p className="font-semibold">{title}</p>
            </div>
          </div>
          <div>
            <p className="hidden font-bold text-[15px] xl1:text-md xl3:text-xl sm:block">
              {title}
            </p>
            <p className="flex items-center gap-1.5 text-[13px] text-muted xl1:text-base xl3:text-lg">
              <MapPin aria-hidden="true" className="size-4 xl3:size-5" /> {area}
            </p>
            <p className="flex items-center gap-1.5 text-[13px] text-muted xl1:text-base xl3:text-lg">
              <Clock aria-hidden="true" className="size-4 xl3:size-5" /> {when}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success-tint px-3.5 py-1.5 text-sm font-semibold text-success xl1:text-base xl3:text-lg">
            <CheckCircle
              aria-hidden="true"
              weight="fill"
              className="size-4 xl3:size-5"
            />{" "}
            Technician assigned
          </span>
          <p className="border-line font-display text-xl font-bold sm:border-l sm:pl-6 xl1:text-2xl xl3:pl-10 xl3:text-3xl">
            {price}
          </p>
        </div>
      </div>
    </>
  );
}
