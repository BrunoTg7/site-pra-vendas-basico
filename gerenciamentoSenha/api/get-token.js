export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a/oauth2/v2.0/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: "c8aa8d75-1943-4d45-b737-b5f9952f8701",
          client_secret: "Yvo8Q~ndJ9MulQ5z3CQm6grgqnOsYhWGhG.8Xday",
          scope: "https://graph.microsoft.com/.default",
        }),
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/*git add .
git commit -m "Descrição das mudanças"
git push
*/
