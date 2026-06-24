fetch('http://localhost:9091/api/v1/processes/3/deploy', {
  method: 'POST'
})
.then(async res => {
  const text = await res.text();
  console.log("STATUS: " + res.status);
  console.log("BODY: " + text);
})
.catch(err => {
  console.error("FETCH ERROR: ", err);
});
