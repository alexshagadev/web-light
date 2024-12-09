export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
  
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch URL');
  
      const html = await response.text();
      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Unable to fetch the HTML of the provided URL.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
  