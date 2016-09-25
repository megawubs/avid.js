import {isArray} from "vue/src/util/lang";

export function map(model, response) {
  var resolved = (isArray(response))
    ? mapResponseToMultiple(response, model)
    : mapResponseToModel(response, model);

  return Promise.resolve(resolved);
}

function mapResponseToModel(response, model) {
  for (var key in response) {
    if (response.hasOwnProperty(key)) {
      model.properties[key] = response[key];
    }
  }
  return model;
}

function mapResponseToMultiple(response, model) {
  return response.map(function (item) {
    return mapResponseToModel(item, model);
  });
}
