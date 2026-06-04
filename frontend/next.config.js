/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const AUTH_URL    = process.env.AUTH_SERVICE_URL    || 'http://localhost:3001';
    const USER_URL    = process.env.USER_SERVICE_URL    || 'http://localhost:3002';
    const PET_URL     = process.env.PET_SERVICE_URL     || 'http://localhost:8080';
    const CHECKIN_URL = process.env.CHECKIN_SERVICE_URL || 'http://localhost:8081';
    const TRIAGE_URL  = process.env.TRIAGE_SERVICE_URL  || 'http://localhost:8082';
    const VET_URL     = process.env.VET_SERVICE_URL     || 'http://localhost:8083';

    return [
      // ── Auth (/api/auth/*  →  :3001) ──────────────────────────────
      { source: '/api/auth/:path*', destination: `${AUTH_URL}/auth/:path*` },

      // ── User (/api/users/:id  →  :3002) ──────────────────────────
      { source: '/api/users/:userId', destination: `${USER_URL}/users/:userId` },

      // /api/users/:id/pets goes to pet service (pet service owns this endpoint)
      { source: '/api/users/:userId/pets', destination: `${PET_URL}/users/:userId/pets` },

      { source: '/api/users/:userId/:path*', destination: `${USER_URL}/users/:userId/:path*` },

      // ── More-specific pet sub-routes FIRST ────────────────────────

      // Vet summary (/api/pets/:id/summaries  →  :8083)
      { source: '/api/pets/:petId/summaries', destination: `${VET_URL}/pets/:petId/summaries` },
      { source: '/api/pets/:petId/summaries/:path*', destination: `${VET_URL}/pets/:petId/summaries/:path*` },

      // Checkins (/api/pets/:id/checkins  →  :8081)
      { source: '/api/pets/:petId/checkins', destination: `${CHECKIN_URL}/pets/:petId/checkins` },
      { source: '/api/pets/:petId/checkins/:path*', destination: `${CHECKIN_URL}/pets/:petId/checkins/:path*` },

      // Concerns by pet (/api/pets/:id/concerns  →  :8082)
      { source: '/api/pets/:petId/concerns', destination: `${TRIAGE_URL}/pets/:petId/concerns` },

      // ── Checkins direct (/api/checkins  →  :8081) ────────────────
      { source: '/api/checkins', destination: `${CHECKIN_URL}/checkins` },
      { source: '/api/checkins/:path*', destination: `${CHECKIN_URL}/checkins/:path*` },

      // ── Concerns (/api/concerns  →  :8082) ───────────────────────
      { source: '/api/concerns', destination: `${TRIAGE_URL}/concerns` },
      { source: '/api/concerns/:path*', destination: `${TRIAGE_URL}/concerns/:path*` },

      // ── Pet CRUD (/api/pets  →  :8080) — catch-all last ──────────
      { source: '/api/pets', destination: `${PET_URL}/pets` },
      { source: '/api/pets/:path*', destination: `${PET_URL}/pets/:path*` },
    ];
  },
};

module.exports = nextConfig;
