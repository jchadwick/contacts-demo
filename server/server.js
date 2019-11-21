const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const contacts = require("./contacts.json");

let contactId = contacts.reduce((max, { id }) => Math.max(max, id), 0);

const app = express();

app.use(cors({ origin: "*" }));

let requestQueue = {};

app.use((req, res, next) => {
  const requestKey = `${req.method} ${req.originalUrl}`;
  const requestedStatusCode = Number(req.query.chaos);

  // trigger chaos if this is the first request to this URL
  // or the user asked for it (via querystring)
  const introduceALittleAnarchy =
    requestQueue[requestKey] == null || requestedStatusCode;

  if (introduceALittleAnarchy) {
    // Track chaos so we don't trigger it next time
    requestQueue[requestKey] = true;

    setTimeout(() => {
      console.log(`${requestKey} => CHAOS MONKEY!`);
      res.statusMessage = "CHAOS MONKEY!";
      res.sendStatus(requestedStatusCode || 500);
    }, 2000);
  } else {
    // Untrack chaos so it can be triggered next time
    delete requestQueue[requestKey];
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

app.post("/contacts", (req, res) => {
  const {
    displayName,
    emailAddress,
    profileImageUrl,
    firstName,
    lastName
  } = req.body;

  const id = contactId++;
  
  const contact = {
    id,
    displayName: displayName ? displayName : `${firstName} ${lastName}`.trim(),
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
