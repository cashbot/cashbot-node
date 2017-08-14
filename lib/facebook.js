var message = function(type) {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: type
      }
    }
  };
};

var card = function(data, label) {
  return {
    title: data.title,
    image_url: data.image,
    subtitle: data.description,
    default_action: {
      type: 'web_url',
      url: data.url
    },
    buttons: [
      {
        type: "web_url",
        url: data.url,
        title: label || 'Check It Out'
      }
    ]
  };
};

module.exports = {
  carousel: function(recommendations, label) {
    var msg = message('generic');
    var ele = [];
    for (var i in recommendations) {
      ele.push(card(recommendations[i], label));
    }
    msg.attachment.payload.elements = ele;
    return msg;
  }
}
