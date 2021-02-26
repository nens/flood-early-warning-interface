export function getMapBackgrounds(access_token: string) {
  return [
    {
      description: "Labelled Satellite Map",
      url: `https://api.mapbox.com/styles/v1/nelenschuurmans/ck8oabi090nys1imfdxgb6nv3/tiles/256/{z}/{x}/{y}@2x?access_token=${access_token}`
    },
    {
      description: "Topographical Map",
      url: `https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${access_token}`
    }
  ];
}
