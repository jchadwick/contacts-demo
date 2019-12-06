const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { observable } = require("mobx");
const ChaosMonkey = require("./ChaosMonkey");
const contacts = require("./contacts.json");
const WebSocket = require("ws");

let contactId = contacts.reduce((max, { id }) => Math.max(max, id), 0) + 1;

const app = express();
require("express-ws")(app);

app.use(cors({ origin: "*" }));

app.use(({ method, originalUrl }, res, next) => {
  next();
  console.log(`${method} ${originalUrl} => ${res.statusCode}`);
});

app.use(bodyParser.json());

app.get("/", (_, res) => res.send("Ok"));

let onlineStatus = observable.box(200);
app.post("/status", (_, res) => res.sendStatus(onlineStatus.get()));
app.post("/status/current", (req, res) => {
  const { code } = req.query;

  if (code && !isNaN(Number(code))) {
    onlineStatus.set(Number(code));
  }

  res.send(String(onlineStatus.get()));
});
app.ws("/status/ws", function(ws, req) {
  const sendStatusUpdate = () => {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(String(onlineStatus.get()));
      }
    } catch {
      /* NOOP */
    }
  };

  onlineStatus.observe(sendStatusUpdate, true);
});

app.use(ChaosMonkey);

app.get("/contacts", (req, res) => {
  const { q } = req.query;

  const query = (q || "").toLowerCase();

  if (query) {
    const filtered = contacts.filter(x =>
      searchValue(x).includes(query.toLowerCase())
    );
    console.log(`Filtered: ${filtered.map(x => x.displayName).join(", ")}`);

    res.send(filtered);
  } else {
    res.send(contacts);
  }
});

const searchValue = contact =>
  `${contact.firstName}|${contact.lastName}|${contact.emailAddress}`.toLowerCase();

app.get("/contacts/suggest/:query", (req, res) => {
  const query = (req.params.query || "").toLowerCase();
  const filtered = contacts.filter(x => searchValue(x).includes(query));
  console.log(`Filtered: ${filtered.map(x => x.displayName).join(", ")}`);

  const results = filtered.map(({ id, displayName, profileImageUrl }) => ({
    id,
    displayName,
    profileImageUrl
  }));

  res.send(results);
});

app.post("/contacts", (req, res) => {
  const { emailAddress, profileImageUrl, firstName, lastName } = req.body;

  const id = contactId++;

  const contact = {
    id,
    firstName,
    lastName,
    emailAddress,
    profileImageUrl: profileImageUrl
      ? profileImageUrl
      : `https://api.adorable.io/avatars/285/${id}${firstName}${lastName}`
  };

  contacts.push(contact);

  res.send(contact);
});

app.get(
  "/contacts/:contactId",
  existingContactAction((contact, req, res) => res.send(contact))
);

app.put(
  "/contacts/:contactId",
  existingContactAction((contact, req, res) => {
    Object.assign(contact, req.body);
    res.send(contact);
  })
);

app.patch(
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
