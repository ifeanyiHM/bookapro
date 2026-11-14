import { ServiceRows } from "@/components/booking/ServiceRows";
import { ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Ticket } from "@/components/ui/Ticket";
import { type CategoryId } from "@/config/booking";
import { listAreas, listServices } from "@/lib/catalog";
import { space, type } from "@/lib/scale";
import { ArrowRight, MapPin } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { addDays, lagosToday } from "../../lib/availability";
import { cn } from "../../lib/cn";
import { formatDay } from "../../lib/format";

export const dynamic = "force-dynamic";

/** Placeholder photos from Pexels (free to use). Replace the src values with your own pictures. */
const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=700`;
const PHOTOS: {
  category: CategoryId;
  label: string;
  alt: string;
  src: string;
}[] = [
  {
    category: "ac",
    label: "AC service",
    alt: "A technician checking a split air conditioner",
    src: "https://i.pinimg.com/736x/b1/e1/8a/b1e18aab336963ac1b51c4b30f31c5e6.jpg",
    // src: "https://i.pinimg.com/736x/84/fa/24/84fa2444f8cc33ef30c8813e95807bb6.jpg",
  },
  {
    category: "electrical",
    label: "Electrical",
    alt: "An electrician repairing a power socket with pliers",
    src: "https://i.pinimg.com/736x/fd/bc/2a/fdbc2ac07afb0fd80b34fcee27ee39f1.jpg",
  },
  {
    category: "plumbing",
    label: "Plumbing",
    alt: "A spanner resting on a stainless steel sink",
    src: "https://i.pinimg.com/236x/12/69/68/1269684b558c99c3fde893400dc00337.jpg",
  },
  {
    category: "cleaning",
    label: "Cleaning",
    alt: "A woman cleaning a home",
    src: "https://i.pinimg.com/736x/b0/dc/7a/b0dc7a17e781d8f71f5183e0372800b6.jpg",
  },
];

const STEPS = [
  {
    title: "Pick the service and your area",
    text: "Every service has a fixed price, shown before you book. Choose the area in Lagos where the job is.",
  },
  {
    title: "Choose a date and arrival window",
    text: "Windows are three hours long. A technician arrives at some point inside the one you pick.",
  },
  {
    title: "Pay through Paystack",
    text: "You pay the listed price, in naira, on Paystack's secure page. We never see your card details.",
  },
  {
    title: "We assign a technician and email you",
    text: "You get a confirmation with your booking reference, and a second email when a technician is assigned. The reference and your phone number let you check the booking at any time.",
  },
];

export default async function HomePage() {
  const [services, areas] = await Promise.all([listServices(), listAreas()]);

  // The sample ticket always shows a believable upcoming date instead of one that goes stale.
  const sampleDate = formatDay(addDays(lagosToday(), 2));

  return (
    <>
      <section className="lg:h-[90vh] lg:flex items-center pb-12 pt-10 md:pt-14 xl1:pb-20 xl1:pt-20 xl3:pb-24 xl3:pt-24 xl4:pb-32 xl4:pt-28">
        <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14 xl1:gap-20 xl3:gap-28 xl4:gap-32">
          <div>
            <h1 className={type.display}>
              Fixed-price home repairs and cleaning in Lagos
            </h1>
            <p
              className={`${type.lead} mt-6 max-w-xl xl1:mt-8 xl1:max-w-2xl xl3:mt-10 xl4:max-w-3xl`}
            >
              Choose a service, your area and an arrival window. You see the
              price before you pay, and a technician is assigned once you have.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 xl1:mt-10 xl3:mt-12">
              <ButtonLink href="/book" size="lg">
                Book a service
              </ButtonLink>
              <Link
                href="/contact-team"
                className="font-semibold text-brand underline decoration-2 underline-offset-4 hover:text-brand-dark xl1:text-lg xl3:text-xl"
              >
                Large or new-build job? Contact our team
                <ArrowRight
                  aria-hidden="true"
                  weight="bold"
                  className="ml-1.5 inline-block align-[-0.1em]"
                />
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:max-w-none xl3:max-w-xl">
            <Ticket
              sample
              reference="IC-7K4M2Q"
              title="Split AC service, 1 unit"
              status={<StatusBadge status="assigned" />}
              rows={[
                { label: "Area", value: "Yaba" },
                { label: "Date", value: sampleDate },
                { label: "Arrival window", value: "11:00 am to 2:00 pm" },
              ]}
              total={{ label: "Price", value: "₦15,000" }}
              className="text-ink drop-shadow-[0_5px_5px_rgba(0,0,0,0.15)] lg:-rotate-2"
            />
            {/* <p className="mt-5 text-sm text-muted xl1:text-base">
              This is what you get after booking: one ticket with your
              reference, time and price.
            </p> */}
          </div>
        </Container>
      </section>

      <section
        id="services"
        className={`${space.section} bg-surface`}
        aria-labelledby="services-heading"
      >
        <Container>
          <SectionHeading
            id="services-heading"
            title="Services and prices"
            description="Standard jobs with a fixed price. Materials you supply are not included unless the service says so."
          >
            <Link
              href="/services"
              className="font-semibold text-brand underline decoration-2 underline-offset-4 xl1:text-lg"
            >
              Full details
            </Link>
          </SectionHeading>
          <ServiceRows services={services} />
        </Container>
      </section>

      <section
        id="how-it-works"
        className={space.section}
        aria-labelledby="how-heading"
      >
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.5fr] xl1:gap-20 xl3:gap-28">
          <div>
            <h2 id="how-heading" className={type.h2}>
              How a booking works
            </h2>
            <p className={`${type.body} mt-3 max-w-md text-muted xl3:mt-5`}>
              Four steps, and every one of them is on the page before you pay.
            </p>
            <ul className="mt-2 grid max-w-md grid-cols-2 gap-1.5 pb-5 xl1:mt-5 xl1:gap-2.5 xl1:pb-6 xl3:max-w-xl">
              {PHOTOS.map((ph) => (
                <li
                  key={ph.category}
                  className="group relative aspect-[4/4] overflow-hidden rounded-md border border-line bg-surface-2 even:translate-y-5 xl1:even:translate-y-6"
                >
                  {/* Plain img so any address works while these are placeholders; use next/image once they are local files. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ph.src}
                    alt={ph.alt}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 left-2 flex w-fit items-center gap-1.5 rounded-md bg-black/35 px-1.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm xl1:text-sm">
                    <CategoryIcon
                      category={ph.category}
                      className="size-4 text-white xl1:size-5"
                    />
                    {ph.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="grid grid-cols-[3rem_1fr] gap-4 py-6 xl1:grid-cols-[4rem_1fr] xl1:py-8 xl3:grid-cols-[5rem_1fr] xl3:py-10"
              >
                <span
                  className="font-display text-3xl font-bold text-brand xl1:text-4xl xl3:text-5xl"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className={type.h3}>{s.title}</h3>
                  <p className={`${type.body} mt-1.5 max-w-2xl text-muted`}>
                    {s.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section
        className={`${space.sectionTight} border-y border-line bg-surface`}
        aria-labelledby="areas-heading"
      >
        <Container className="grid gap-6 lg:grid-cols-[1fr_1.5fr] xl1:gap-20 xl3:gap-28">
          <div>
            <h2 id="areas-heading" className={type.h2}>
              Where we work
            </h2>
            <p className={cn(type.body, "mt-3 max-w-md text-muted")}>
              Lagos only for now. Pick your area when you book.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-2.5 gap-y-3 self-center xl3:gap-x-3 xl3:gap-y-4">
            {areas.map((a) => (
              <li
                key={a.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-paper py-1.5 pl-3 pr-4 text-[0.95rem] font-medium xl1:py-2 xl1:pl-3.5 xl1:pr-5 xl1:text-base xl3:text-lg"
              >
                <MapPin
                  aria-hidden="true"
                  weight="fill"
                  className="size-4 text-brand xl1:size-5"
                />
                {a.name}
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}

// import { ServiceRows } from "@/components/booking/ServiceRows";
// import { ButtonLink } from "@/components/ui/Button";
// import { Container } from "@/components/ui/Container";
// import { SectionHeading } from "@/components/ui/SectionHeading";
// import { StatusBadge } from "@/components/ui/StatusBadge";
// import { Ticket } from "@/components/ui/Ticket";
// import { listAreas, listServices } from "@/lib/catalog";
// import { space, type } from "@/lib/scale";
// import { ArrowRight, MapPin } from "@phosphor-icons/react/dist/ssr";
// import Link from "next/link";
// import { addDays, lagosToday } from "../../lib/availability";
// import { cn } from "../../lib/cn";
// import { formatDay } from "../../lib/format";

// export const dynamic = "force-dynamic";

// const STEPS = [
//   {
//     title: "Pick the service and your area",
//     text: "Every service has a fixed price, shown before you book. Choose the area in Lagos where the job is.",
//   },
//   {
//     title: "Choose a date and arrival window",
//     text: "Windows are three hours long. A technician arrives at some point inside the one you pick.",
//   },
//   {
//     title: "Pay through Paystack",
//     text: "You pay the listed price, in naira, on Paystack's secure page. We never see your card details.",
//   },
//   {
//     title: "We assign a technician and email you",
//     text: "You get a confirmation with your booking reference, and a second email when a technician is assigned. The reference and your phone number let you check the booking at any time.",
//   },
// ];

// /** Caution tape: the trade's own warning stripe, used as the page's one loud detail. */
// const TAPE =
//   "repeating-linear-gradient(-45deg, var(--color-amber) 0 14px, var(--color-ink) 14px 28px)";

// function Tape({ className }: { className?: string }) {
//   return (
//     <div
//       aria-hidden="true"
//       className={cn("h-3 xl3:h-4", className)}
//       style={{ background: TAPE }}
//     />
//   );
// }

// export default async function HomePage() {
//   const [services, areas] = await Promise.all([listServices(), listAreas()]);

//   // The sample ticket always shows a believable upcoming date instead of one that goes stale.
//   const sampleDate = formatDay(addDays(lagosToday(), 2));

//   return (
//     <>
//       {/* Hero: deep teal so the white job ticket is the brightest thing on the screen. */}
//       <section className="relative bg-brand-dark text-white lg:flex lg:min-h-[88vh] lg:items-center">
//         <Container className="grid items-center gap-14 pb-20 pt-12 md:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-14 xl1:gap-20 xl1:pb-28 xl1:pt-20 xl3:gap-28 xl4:gap-32">
//           <div>
//             <h1 className={cn(type.display, "text-white")}>
//               Fixed-price home repairs and cleaning in Lagos
//             </h1>
//             <p
//               className={cn(
//                 type.lead,
//                 "mt-6 max-w-xl text-white/80 xl1:mt-8 xl1:max-w-2xl xl3:mt-10 xl4:max-w-3xl",
//               )}
//             >
//               Choose a service, your area and an arrival window. You see the
//               price before you pay, and a technician is assigned once you have.
//             </p>
//             <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 xl1:mt-10 xl3:mt-12">
//               <ButtonLink
//                 href="/book"
//                 size="lg"
//                 className="bg-white text-ink hover:bg-white"
//               >
//                 Book a service
//               </ButtonLink>
//               <Link
//                 href="/contact-team"
//                 className="font-semibold text-white underline decoration-white decoration-2 underline-offset-4 hover:decoration-white xl1:text-lg xl3:text-xl"
//               >
//                 Large or new-build job? Contact our team
//                 <ArrowRight
//                   aria-hidden="true"
//                   weight="bold"
//                   className="ml-1.5 inline-block align-[-0.1em]"
//                 />
//               </Link>
//             </div>
//           </div>

//           <div className="mx-auto w-full max-w-md lg:max-w-none xl3:max-w-xl">
//             <Ticket
//               sample
//               reference="IC-7K4M2Q"
//               title="Split AC service, 1 unit"
//               status={<StatusBadge status="assigned" />}
//               rows={[
//                 { label: "Area", value: "Yaba" },
//                 { label: "Date", value: sampleDate },
//                 { label: "Arrival window", value: "11:00 am to 2:00 pm" },
//               ]}
//               total={{ label: "Price", value: "₦15,000" }}
//               className="text-ink drop-shadow-[0_22px_32px_rgba(0,0,0,0.35)] lg:-rotate-2"
//             />
//             <p className="mt-5 text-sm text-white/70 xl1:text-base">
//               This is what you get after booking: one ticket with your
//               reference, time and price.
//             </p>
//           </div>
//         </Container>
//         <Tape className="absolute inset-x-0 bottom-0" />
//       </section>

//       <section
//         id="services"
//         className={`${space.section} bg-surface`}
//         aria-labelledby="services-heading"
//       >
//         <Container>
//           <SectionHeading
//             id="services-heading"
//             title="Services and prices"
//             description="Standard jobs with a fixed price. Materials you supply are not included unless the service says so."
//           >
//             <Link
//               href="/services"
//               className="font-semibold text-brand underline decoration-2 underline-offset-4 xl1:text-lg"
//             >
//               Full details
//             </Link>
//           </SectionHeading>
//           <ServiceRows services={services} />
//         </Container>
//       </section>

//       <section
//         id="how-it-works"
//         className={space.section}
//         aria-labelledby="how-heading"
//       >
//         <Container className="grid gap-10 lg:grid-cols-[1fr_1.5fr] xl1:gap-20 xl3:gap-28">
//           <div>
//             <h2 id="how-heading" className={type.h2}>
//               How a booking works
//             </h2>
//             <p className={`${type.body} mt-3 max-w-md text-muted xl3:mt-5`}>
//               Four steps, and every one of them is on the page before you pay.
//             </p>
//           </div>
//           <ol className="divide-y divide-line border-y border-line">
//             {STEPS.map((s, i) => (
//               <li
//                 key={s.title}
//                 className="grid grid-cols-[3rem_1fr] gap-4 py-6 xl1:grid-cols-[4rem_1fr] xl1:py-8 xl3:grid-cols-[5rem_1fr] xl3:py-10"
//               >
//                 <span
//                   className="font-display text-3xl font-bold text-brand xl1:text-4xl xl3:text-5xl"
//                   aria-hidden="true"
//                 >
//                   {i + 1}
//                 </span>
//                 <div>
//                   <h3 className={type.h3}>{s.title}</h3>
//                   <p className={`${type.body} mt-1.5 max-w-2xl text-muted`}>
//                     {s.text}
//                   </p>
//                 </div>
//               </li>
//             ))}
//           </ol>
//         </Container>
//       </section>

//       <section
//         className={`${space.sectionTight} border-y border-line bg-surface`}
//         aria-labelledby="areas-heading"
//       >
//         <Container className="grid gap-6 lg:grid-cols-[1fr_1.5fr] xl1:gap-20 xl3:gap-28">
//           <div>
//             <h2 id="areas-heading" className={type.h2}>
//               Where we work
//             </h2>
//             <p className={cn(type.body, "mt-3 max-w-md text-muted")}>
//               Lagos only for now. Pick your area when you book.
//             </p>
//           </div>
//           <ul className="flex flex-wrap gap-x-2.5 gap-y-3 self-center xl3:gap-x-3 xl3:gap-y-4">
//             {areas.map((a) => (
//               <li
//                 key={a.id}
//                 className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-paper py-1.5 pl-3 pr-4 text-[0.95rem] font-medium xl1:py-2 xl1:pl-3.5 xl1:pr-5 xl1:text-base xl3:text-lg"
//               >
//                 <MapPin
//                   aria-hidden="true"
//                   weight="fill"
//                   className="size-4 text-brand xl1:size-5"
//                 />
//                 {a.name}
//               </li>
//             ))}
//           </ul>
//         </Container>
//       </section>

//       <section className="bg-ink text-white" aria-labelledby="team-heading">
//         <Tape />
//         <Container
//           className={`${space.section} grid items-center gap-8 lg:grid-cols-[1.5fr_1fr] xl1:gap-20 xl3:gap-28`}
//         >
//           <div>
//             <h2 id="team-heading" className={cn(type.h2, "max-w-3xl")}>
//               Building or renovating? Talk to our team.
//             </h2>
//             <p
//               className={cn(type.body, "mt-4 max-w-2xl text-white/80 xl3:mt-6")}
//             >
//               New-build wiring, full plumbing installations and larger AC
//               projects are not priced online. Tell us about the project and the
//               team will contact you.
//             </p>
//           </div>
//           <div className="lg:justify-self-end">
//             <ButtonLink
//               href="/contact-team"
//               size="lg"
//               className="bg-amber text-ink hover:bg-white"
//             >
//               Contact our team
//             </ButtonLink>
//           </div>
//         </Container>
//       </section>
//     </>
//   );
// }
