const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const contacts = require("./contacts.json");

let contactId = contacts.reduce((max, { id }) => Math.max(max, id), 0);

const app = express();

app.use(cors({ origin: "*" }));

let requestCount = 0;

app.use((req, res, next) => {
  requestCount += 1;

  res.setHeader("X-RequestCount", String(requestCount));

  const requestedStatus = Number(req.query.status);

  if (requestedStatus || requestCount % 2) {
    setTimeout(() => {
      console.log(`${req.method} ${req.originalUrl} => CHAOS MONKEY!`);
      res.statusMessage = "CHAOS MONKEY!";
      res.sendStatus(requestedStatus || 500);
    }, 2000);
  } else {
    next();
  }
});

app.use(({ method, originalUrl }, res, next) => {
  next();
  console.log(`${method} ${originalUrl} => ${res.statusCode}`);
});

app.use(bodyParser.json());

app.get("/", (_, res) => res.send("Ok"));

app.get("/contacts", (_, res) => res.send(contacts));

app.get("/contacts/suggest/:query", (req, res) => {
  const query = (req.params.query || "").toLowerCase();
  const filtered = contacts.filter(x => x.displayName.includes(query));

  const results = filtered.map(({ id, displayName, profileImageUrl }) => ({
    id,
    displayName,
    profileImageUrl
  }));

  res.send(results);
});

app.put("/contacts", (req, res) => {
  const contact = {
    id: contactId++,
    ...req.body
  };

  contacts.push(contact);

  res.send(contact);
});

app.get(
  "/contacts/:contactId",
  existingContactAction((contact, req, res) => res.send(contact))
);

app.post(
  "/contacts/:contactId",
  existingContactAction((contact, req, res) => {
    Object.assign(contact, req.body);
    res.send(contact);
  })
);

app.delete(
  "/contacts/:contactId",
  existingContactAction((contact, req, res) => {
    contacts.splice(contacts.indexOf(contact), 1);
    res.status(204);
    res.end();
  })
);

function existingContactAction(cb) {
  return (req, res) => {
    const contactId = Number(req.params.contactId);
    const contact = contacts.find(x => x.id === contactId);

    if (!contact) {
      res.status(404);
      res.end();
    } else {
      cb(contact, req, res);
    }
  };
}

const port = process.env.PORT || 8080;
app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);
