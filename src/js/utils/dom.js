export const createElement = (tagName, property = {}) => {
  const $create = document.createElement(tagName);
  Object.entries(property).forEach(([key, value]) => {
    if (key === 'dataset') {
      Object.entries(value).forEach(([datasetId, datasetValue]) =>
        $create.setAttribute(`data-${datasetId}`, datasetValue),
      );
    }
    if (typeof $create[key] === 'string') {
      $create[key] = value;
    }
  });

  return $create;
};

export const $ = (selector, parentElement = document) => parentElement.querySelector(selector);

export const $$ = (selector, parentElement = document) => parentElement.querySelectorAll(selector);
