"use client";

import {
  useEffect,
  useState,
} from "react";

import MockTestFilters from "./MockTestFilters";
import MockTestList from "./MockTestList";

export default function MockTestContent({
  cid,
  uid = 0,
  examName,
  shortName,
  governmentExamsSlug,
  categories = [],
}) {
  const [
    activeFilter,
    setActiveFilter,
  ] = useState(0);

  /* =======================================================
     RESET FILTER WHEN COURSE CHANGES

     Kerala PSC -> RRB/SSC
     RRB/SSC -> Kerala PSC
  ======================================================= */

  useEffect(() => {
    setActiveFilter(0);
  }, [cid]);

  return (
    <section className="mt-5">
      <MockTestFilters
        categories={
          categories
        }
        activeFilter={
          activeFilter
        }
        onChange={
          setActiveFilter
        }
      />

      <div className="mt-5">
        <MockTestList
          cid={cid}
          uid={uid}
          filter={
            activeFilter
          }
          examName={
            examName
          }
          shortName={
            shortName
          }
          governmentExamsSlug={
            governmentExamsSlug
          }
        />
      </div>
    </section>
  );
}