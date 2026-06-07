import type { PlanId } from "@/lib/limits";

export type PromoCodeRecord = {
  code: string;
  plan: Exclude<PlanId, "free" | "creator">;
  label: string;
  durationDays: number;
  usageLimit: number;
  status: "active" | "inactive";
};

export const PROMO_CODES = [
  {
    "code": "DTX-LITE-0132M3-056",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-10NM0E-063",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-14W1ZX-046",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-1BSIA1-017",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-2GG2JL-039",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-2L6VQ4-002",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-32GJ9N-045",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-3BH5O1-081",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-3IQLO2-086",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-5067K6-057",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-5F7J6R-023",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-5G74CS-087",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-5M1LKR-010",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-65P44E-025",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-6ATQZN-089",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-6I5ZZA-013",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-7374PE-019",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-7QA28D-029",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-87WRD3-060",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-8BA3KF-043",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-90DIMR-071",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-9QJDUL-050",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-9RNOQM-037",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-9SO9ZC-076",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-9XVQ9B-084",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-AE3BYX-096",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-AE7TJT-030",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-AOGKXC-093",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-B63AY5-061",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-B97L6T-027",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-C2STCP-026",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-C3BSOI-047",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-CE91ML-040",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-CH00DF-083",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-CSG7DV-085",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-CT0HO1-009",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-CVEXIC-065",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-DGNYKX-051",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-DKRUM4-003",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-E19CV2-070",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-FAOYJ7-032",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-FVJ7A8-088",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-GAXQB5-068",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-GCMO6M-066",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-GFIH9U-018",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-H3O49M-052",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-H6WP7L-079",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-H7EAUI-035",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-HOLC56-031",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-I377IM-048",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-IWT0L2-011",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-JGZOST-069",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-JZYU5S-059",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-KR4UK3-075",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-KRXAXR-049",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-KWBOOD-099",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-L49VJV-020",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-L7P0HQ-054",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-LII4JH-062",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-LO0A0K-041",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-M3S9OO-077",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-NCDB03-007",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-NCO01N-092",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-NGXRZC-055",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-NPN1JY-024",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-NQJM1Q-008",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-OBU2US-053",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-OD45YJ-022",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-OG1YXS-004",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-OOINDA-038",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-P2R160-095",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-P6YY00-058",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-PW41R5-014",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-Q4V9N9-005",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-Q60HA0-028",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-Q6ZTPP-067",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-QIFWOD-072",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-QW7JER-082",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-RFLK3O-021",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-RI42WT-033",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-RWN4G2-034",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-U2M5RV-094",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-U2SGEN-080",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-UNJSTS-001",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-UUEV9H-100",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-VEIK34-098",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-VQ9ELD-091",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-VWR2ZH-064",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-W0LXUT-036",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-W3V7AJ-044",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-WKG436-073",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-WSFVNY-015",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-XR5A1P-074",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-XYUL4W-097",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-Y2OUIX-078",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-Y3FDHW-016",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-Y7BOK7-006",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-YTQ8K7-012",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-YZDK7E-090",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-LITE-Z99J9C-042",
    "plan": "lite",
    "label": "Lite",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-01Y828-053",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-05M7AH-098",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-0NLBWC-020",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-0RA7LZ-024",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-25R3GZ-046",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-2CMA58-015",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-2YLF45-027",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-3NFGC4-072",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-41IGF4-054",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-49B6HP-050",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-4MT6J3-043",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-594FYN-016",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-5F1CAR-085",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-5HKOOF-008",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-5MBC0F-037",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-6Y9DUN-078",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-77GK7Q-026",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-7K0U6O-087",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-7NJM6C-079",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-7NV12P-006",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-933UKV-012",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-9JVQH8-025",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-9W4X3D-069",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-9Z0HMF-042",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-APXK9J-021",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-BAR913-023",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-BHJVN8-013",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-BKEYUC-067",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-BKOPF3-083",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-BW8TLI-036",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-C6AO33-088",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-C8YZ64-073",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-CBX9IW-089",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-D16UX2-090",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-DBQ5IW-028",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-DHVMSN-099",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-DZAH7I-047",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-EN8RM2-002",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-ERBEJ9-014",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-FG6BEV-081",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-FMRFJ1-094",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-FO7V8Q-005",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-FPJUL1-003",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-FQIOGD-063",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-FW3QRS-035",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-G9W3B0-038",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-HEFI23-068",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-HN5RES-061",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-HT85NW-031",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-I9TZVN-001",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-IARCA2-011",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-J2N894-058",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-J4JUVW-019",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-J58KKQ-076",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-JD77SH-049",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-JJNVLJ-095",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-JJURKO-060",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-JKK591-039",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-JM4RWL-080",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-JNT55N-041",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-JPQSHQ-045",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-K1E8DU-029",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-K1UUDN-097",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-K6Y8TQ-065",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-KNP71F-040",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-MPQBR4-056",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-N9QLLS-009",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-NL4QD0-034",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-NTZF7U-018",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-O3E1WL-070",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-O91H2O-096",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-OHBD98-071",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-OS8B8I-086",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-P36HOQ-033",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-P5LS3P-066",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-PJZKD3-084",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-PWZYBX-030",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-Q48MZ6-007",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-Q5RF98-057",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-Q9LFTN-064",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-QHUYFE-075",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-QUIGAY-052",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-SAY6MQ-074",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-SLCTZT-051",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-SM0U9I-048",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-T5DLJ0-100",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-TQ3XO4-059",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-TV5J67-044",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-TVM6NY-077",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-U1SLBL-004",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-U5L2QK-062",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-UFPUO5-055",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-UJWIIS-082",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-ULRTQ2-032",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-WI696L-093",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-WSLWYS-017",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-WZJBCE-022",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-XTGEER-092",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-XXVJVR-010",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PLUS-Z4UKM9-091",
    "plan": "go",
    "label": "Plus",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-01RB9A-084",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-03D7H9-078",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-0G9ZGH-031",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-0PXW9Z-005",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-12TUCW-089",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-16F2C5-014",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-1AC8PO-011",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-1MLBJG-056",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-1O6KMY-093",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-26MN21-044",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-3XGC9I-047",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-4EG1F2-013",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-4MJEC5-009",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-61LNHR-030",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-68HZFW-086",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-6C45GG-032",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-72ECV1-046",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-74HWL3-061",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-7ALZ6Y-073",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-7CEYRV-090",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-7KRIEE-015",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-7LA2YT-010",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-7QIB2N-094",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-88PIWL-058",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-94MOTX-050",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-97PHU5-071",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-A8B76Z-033",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-A8M3DA-049",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-AJ7ADG-075",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-AN0NZH-008",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-B6BHVR-039",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-BLEQ22-059",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-BRVFPZ-018",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-BS3X54-006",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-BSEH25-088",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-BUJSSU-074",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-CMZYTN-076",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-CTLCP8-082",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-CXJFNP-068",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-DACB3B-036",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-DHJOZJ-029",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-E0W4WY-007",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-EAUFSW-025",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-EEFUYT-004",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-F030YV-002",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-FFWQNG-024",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-GCP6W7-048",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-H5BHSW-097",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-HWRQ1P-096",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-IFZFQK-022",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-ITDLTJ-037",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-J2O8Y1-063",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-JCNE0V-028",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-JJHPTN-041",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-JLH4PN-057",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-JX832E-087",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-K4AUQP-023",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-KDVJZ0-067",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-KHGYC2-026",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-KRHEVO-100",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-KX9HJ8-065",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-LBILNL-069",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-LUCNR8-098",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-M4XNYR-038",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-M72WAT-064",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-MCXK5A-070",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-N05MLU-034",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-NA6269-043",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-NHV4UD-081",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-O0JIGJ-053",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-O6FUMK-042",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-OJ1MU4-040",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-OLFEE5-003",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-ORGUGJ-095",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-OUWAP5-079",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-P3H7BL-091",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-PA2HKA-055",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-PFNS1S-099",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-PG8DZS-085",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-PN2PXK-072",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-PQNAR7-077",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-PTHF47-060",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-PUWEPQ-001",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-Q9DK6A-066",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-QPEO8G-035",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-QPYZH0-021",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-SPZN3L-092",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-TO0XXI-054",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-TWAZVN-012",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-URJLC6-080",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-V7AS7E-052",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-W3EJ1Z-045",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-WAE4G8-020",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-WAPFZE-051",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-XVXIIQ-027",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-XZTIU3-017",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-Y2BRJO-062",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-ZIFPOU-019",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-ZVHNY9-083",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PRO-ZVY0ZQ-016",
    "plan": "pro",
    "label": "Pro",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-0RS9T0-098",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-0WDM0L-009",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-0WIYL2-017",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-199XLI-021",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-1R1IGM-014",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-217P25-100",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-2PXQD9-075",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-39BZVM-059",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-3ZAI07-099",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-42IK8G-048",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-42ZQ8S-007",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-4AE1L5-073",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-4SE0U7-046",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-5GYSMZ-042",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-62J502-097",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-64UOSX-051",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-74MR5X-081",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-7IVYIW-053",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-8B1W8J-012",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-9H7KBN-095",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-9IH3FQ-049",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-9OT12W-067",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-9UYDFS-093",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-A6FZQE-056",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-AAYKM7-043",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-AV73VW-050",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-AZCB2M-080",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-B265S8-019",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-BEQX39-015",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-BN7VMZ-034",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-CGU8E3-045",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-CT0RT9-002",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-D6QNT2-061",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-D81XMA-029",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-D8KIWU-025",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-DFN8XO-039",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-DG4C0D-065",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-ECOMRF-094",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-EMKUVV-074",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-ERY78X-033",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-FOIS5A-016",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-G1H0HV-089",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-G1TUPM-038",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-GVUX2I-086",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-H4IEYQ-057",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-HCNBWH-088",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-HID2A8-005",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-HUR45Y-047",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-IH95R5-032",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-IV6C01-068",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-IYVR5X-082",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-J1NQX2-070",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-JH2MC2-079",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-JIY359-083",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-K130RJ-006",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-KAUVRG-071",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-KFFC7G-035",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-LP70KE-003",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-M2KKE1-078",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-MEK0HT-066",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-MGDHFS-060",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-MGFYQU-023",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-MNDJ6H-040",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-NJ76HU-054",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-NXBAXE-077",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-O07IH9-072",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-OLB9AZ-090",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-OLFRYR-091",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-OORCRV-085",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-OUX2PM-028",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-P1955Y-004",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-PEWEB1-044",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-PNQ5FR-069",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-PRJ7D8-063",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-QHS8AA-031",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-QRX4JO-055",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-QYT84J-026",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-R014SX-020",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-RMENDT-013",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-S3TCO4-027",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-SAEI5F-037",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-SBJ616-041",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-T2MIDF-084",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-TGO7EI-008",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-U05LCJ-058",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-U1B2C6-052",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-U68LWQ-087",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-UYIA4A-076",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-UZULSW-036",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-V4ZBNH-022",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-VTQXL8-064",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-W0R40Y-062",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-WE9X6G-092",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-WH2F66-030",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-X84O63-010",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-XMUY2K-024",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-XP53VJ-011",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-YCKUR4-018",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-ZAEMLR-001",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-PREM-ZPP0VF-096",
    "plan": "premium",
    "label": "Premium",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-0FP7K9-044",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-0N0RAD-020",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-1433IK-001",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-1M9QDE-090",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-1MA3QJ-006",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-1PABNZ-092",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-22TCI1-070",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-2B7MIP-084",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-3EBKEH-015",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-3VJH7Z-091",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-42XRZS-002",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-46I5Z8-038",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-4HJMTU-093",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-53A26Q-023",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-5B00J2-033",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-5UK77M-062",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-6ROW7E-085",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-75BE2Q-018",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-7MKSQW-089",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-8A4K9M-100",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-8DA2P6-004",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-8Y91D2-007",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-9492A3-029",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-96H8Z1-014",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-9CJPIM-049",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-9FL0K9-067",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-A7HJ29-013",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-ACTU4V-095",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-B16POO-054",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-B6JIX0-069",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-C9514M-086",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-CJMRU8-079",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-D50QY3-030",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-DCGMLW-032",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-DFYEU8-003",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-DYOZNA-087",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-E4M0PH-061",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-FCMMI3-022",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-FHUK68-068",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-FQFF06-021",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-GYJMES-065",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-H8MV9C-098",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-HGX7U0-012",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-I0BLN6-011",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-I4TYVM-052",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-I9XMFT-037",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-ITESXS-027",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-J2SNET-088",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-JKI5DZ-016",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-JKUYGZ-073",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-K2JN7V-082",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-K4W4ID-075",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-K5YHB4-058",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-KDC0PC-042",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-KFMX1W-071",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-LHBQ0F-046",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-LXCOYR-048",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-M2AV4H-005",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-MQUL7N-080",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-N29ZT0-056",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-N7ORF5-019",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-NAUUDI-094",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-NPIAYW-057",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-OC797R-031",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-OEGC47-074",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-OVQF34-047",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-OW70HR-099",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-POEYFA-072",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-PS72L0-063",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-PV6SHI-050",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-PZ9OJF-009",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-PZVE0S-034",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-Q3IWKV-077",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-Q5DQJC-045",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-QZ3PWX-059",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-R3B2R0-025",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-RKRIW8-043",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-RMK42I-051",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-RPV3PG-039",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-RTLQZM-041",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-RZ0UDL-036",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-S5NBLZ-066",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-T0PW2B-053",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-TEVJU9-076",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-UNHKUO-055",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-V5PFXB-035",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-V5UBV7-083",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-W24Q3A-017",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-W5J3MI-024",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-W9KUFH-008",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-WGTG3Y-064",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-WQ1C5R-096",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-WXC3FX-060",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-X0R573-028",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-X1D0NZ-097",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-X1JO5M-040",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-XCQ9H8-010",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-YKX27F-081",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-YPYFMJ-078",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  },
  {
    "code": "DTX-ULT-YUBW0A-026",
    "plan": "ultimate",
    "label": "Ultimate",
    "durationDays": 30,
    "usageLimit": 1,
    "status": "active"
  }
] as const satisfies readonly PromoCodeRecord[];

export const PROMO_CODE_COUNTS = {
  "lite": 100,
  "go": 100,
  "pro": 100,
  "premium": 100,
  "ultimate": 100
} as const;
