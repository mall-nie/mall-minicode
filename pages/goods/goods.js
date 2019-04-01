import Notify from '../../components/notify/index';
var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var user = require('../../utils/user.js');


const posterConfig = {
  jdConfig: {
    width: 750,
    height: 1000,
    backgroundColor: '#fff',
    debug: false,
    blocks: [{
        width: 690,
        height: 808,
        x: 30,
        y: 183,
        borderWidth: 2,
        borderColor: '#f0c2a0',
        borderRadius: 20,
      },
      {
        width: 634,
        height: 74,
        x: 59,
        y: 770,
        backgroundColor: '#fff',
        opacity: 0.5,
        zIndex: 100,
      },
    ],
    texts: [{
        x: 113,
        y: 61,
        baseLine: 'middle',
        text: '聂祥1',
        fontSize: 32,
        color: '#8d8d8d',
      },
      {
        x: 30,
        y: 113,
        baseLine: 'top',
        text: '',
        fontSize: 38,
        color: '#080808',
      },
      {
        x: 92,
        y: 810,
        fontSize: 38,
        baseLine: 'middle',
        text: '聂祥3',
        width: 570,
        lineNum: 1,
        color: '#8d8d8d',
        zIndex: 200,
      },
      {
        x: 59,
        y: 895,
        baseLine: 'middle',
        text: [{
            text: '2人拼',
            fontSize: 28,
            color: '#ec1731',
          },
          {
            text: '¥99',
            fontSize: 36,
            color: '#ec1731',
            marginLeft: 30,
          }
        ]
      },
      {
        x: 522,
        y: 895,
        baseLine: 'middle',
        text: '已拼2件',
        fontSize: 28,
        color: '#929292',
      },
      {
        x: 59,
        y: 945,
        baseLine: 'middle',
        text: [{
            text: '商家发货&售后',
            fontSize: 28,
            color: '#929292',
          },
          {
            text: '七天退货',
            fontSize: 28,
            color: '#929292',
            marginLeft: 50,
          },
          {
            text: '运费险',
            fontSize: 28,
            color: '#929292',
            marginLeft: 50,
          },
        ]
      },
      {
        x: 360,
        y: 1065,
        baseLine: 'top',
        text: '长按识别小程序码',
        fontSize: 38,
        color: '#080808',
      },
      {
        x: 360,
        y: 1123,
        baseLine: 'top',
        text: '超值好货一起拼',
        fontSize: 28,
        color: '#929292',
      },
    ],
    images: [{
        width: 62,
        height: 62,
        x: 30,
        y: 30,
        borderRadius: 62,
        url: 'https://lc-I0j7ktVK.cn-n1.lcfile.com/02bb99132352b5b5dcea.jpg',
      },
      {
        width: 634,
        height: 634,
        x: 59,
        y: 210,
        url: 'https://lc-I0j7ktVK.cn-n1.lcfile.com/193256f45999757701f2.jpeg',
      },
      {
        width: 220,
        height: 220,
        x: 92,
        y: 1020,
        url: 'https://lc-I0j7ktVK.cn-n1.lcfile.com/d719fdb289c955627735.jpg',
      }
    ]

  }
}



Page({
  data: {
    id: 0,
    goods: {},
    posterConfig: posterConfig.jdConfig,
    attributeList: [],
    issueList: [],
    comment: [],
    brand: {},
    specificationList: [],
    productList: [],
    relatedGoods: [],
    userHasCollect: 0,
    number: 1,
    checkedSpecText: '规格数量选择',
    tmpSpecText: '请选择规格数量',
    checkedSpecPrice: 0,
    showPop: false,
    openAttr: false,
    noCollectImage: '/static/images/icon_collect.png',
    hasCollectImage: '/static/images/icon_collect_checked.png',
    collectImage: '/static/images/icon_collect.png',
    shareImage: '',
    soldout: false,
    collectStatus: "收藏"
  },

  onReady: function() {
    // 页面渲染完成
    this.notify = this.selectComponent("#van-notify");
  },
  // 下拉刷新
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getGoodsInfo();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  onShow: function() {
    // 页面显示
    if (app.globalData.hasLogin) {
      this.getCollectStatus();
    }
  },


  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    if (options.id) {
      this.setData({
        id: parseInt(options.id)
      });
      this.getGoodsInfo();
    }
  },


  // 页面分享
  onShareAppMessage: function() {
    let that = this;
    return {
      title: that.data.goods.name,
      desc: '精品推荐',
      path: '/pages/index/index?goodId=' + this.data.id
    }
  },

  closeShare: function () {
    this.setData({
      showPop: false,
    });
  },

  togglePopup: function() {
    let that = this;
    this.setData({
      showPop: !this.data.showPop,
    });
  },

  // 获取商品信息 没有问题
  getGoodsInfo: function() {
    wx.showLoading({
      title: '加载中',
    });

    setTimeout(function() {
      wx.hideLoading()
    }, 2000);

    let that = this;
    util.request(api.GoodsDetail, {
      id: that.data.id
    }).then(function(res) {
      if (res.errno === 0) {

        let _specificationList = res.data.specificationList
        // 如果仅仅存在一种货品，那么商品页面初始化时默认checked
        if (_specificationList.length == 1) {
          if (_specificationList[0].valueList.length == 1) {
            _specificationList[0].valueList[0].checked = true

            // 如果仅仅存在一种货品，那么商品价格应该和货品价格一致
            // 这里检测一下
            let _productPrice = res.data.productList[0].price;
            let _goodsPrice = res.data.info.retailPrice;
            if (_productPrice != _goodsPrice) {
              console.error('商品数量价格和货品不一致');
            }

            that.setData({
              checkedSpecText: _specificationList[0].valueList[0].value,
              tmpSpecText: '已选择：' + _specificationList[0].valueList[0].value,
            });
          }
        }

        that.setData({
          goods: res.data.info,
          attributeList: res.data.attribute,
          issueList: res.data.issue,
          comment: res.data.comment,
          brand: res.data.brand,
          specificationList: res.data.specificationList,
          productList: res.data.productList,
          userHasCollect: res.data.userHasCollect,
          shareImage: res.data.shareImage,
          checkedSpecPrice: res.data.info.retailPrice
        });
        if (res.data.userHasCollect == 1) {
          that.setData({
            collectImage: that.data.hasCollectImage
          });
        } else {
          that.setData({
            collectImage: that.data.noCollectImage
          });
        }

        WxParse.wxParse('goodsDetail', 'html', res.data.info.detail, that);
        //获取推荐商品
        that.getGoodsRelated();
        wx.hideLoading();
      }
    });
  },

  onPosterSuccess(e) {
    console.log(e);
    const {
      detail
    } = e;
    wx.previewImage({
      current: detail,
      urls: [detail]
    })
  },
  onPosterFail(err) {
    console.error(err);
  },

  // 获取推荐商品 没有问题
  getGoodsRelated: function() {
    let that = this;
    util.request(api.GoodsRelated, {
      id: that.data.id
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          relatedGoods: res.data.goodsList,
        });
      }
    });
  },

  // 规格选择 
  clickSkuValue: function(event) {
    let that = this;
    let specName = event.currentTarget.dataset.name;
    let specValueId = event.currentTarget.dataset.valueId;

    //判断是否可以点击

    //TODO 性能优化，可在wx:for中添加index，可以直接获取点击的属性名和属性值，不用循环
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      if (_specificationList[i].name === specName) {
        for (let j = 0; j < _specificationList[i].valueList.length; j++) {
          if (_specificationList[i].valueList[j].id == specValueId) {
            //如果已经选中，则反选
            if (_specificationList[i].valueList[j].checked) {
              _specificationList[i].valueList[j].checked = false;
            } else {
              _specificationList[i].valueList[j].checked = true;
            }
          } else {
            _specificationList[i].valueList[j].checked = false;
          }
        }
      }
    }
    this.setData({
      specificationList: _specificationList,
    });
    //重新计算spec改变后的信息
    this.changeSpecInfo();

    //重新计算哪些值不可以点击
  },

  //获取选中的规格信息
  getCheckedSpecValue: function() {
    let checkedValues = [];
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      let _checkedObj = {
        name: _specificationList[i].name,
        valueId: 0,
        valueText: ''
      };
      for (let j = 0; j < _specificationList[i].valueList.length; j++) {
        if (_specificationList[i].valueList[j].checked) {
          _checkedObj.valueId = _specificationList[i].valueList[j].id;
          _checkedObj.valueText = _specificationList[i].valueList[j].value;
        }
      }
      checkedValues.push(_checkedObj);
    }

    return checkedValues;
  },

  //判断规格是否选择完整
  isCheckedAllSpec: function() {
    return !this.getCheckedSpecValue().some(function(v) {
      if (v.valueId == 0) {
        return true;
      }
    });
  },

  soldoutNotify: function() {
    Notify("商品已售完");
  },

  getCheckedSpecKey: function() {
    let checkedValue = this.getCheckedSpecValue().map(function(v) {
      return v.valueText;
    });
    return checkedValue;
  },

  // 规格改变时，重新计算价格及显示信息
  changeSpecInfo: function() {
    let checkedNameValue = this.getCheckedSpecValue();

    //设置选择的信息
    let checkedValue = checkedNameValue.filter(function(v) {
      if (v.valueId != 0) {
        return true;
      } else {
        return false;
      }
    }).map(function(v) {
      return v.valueText;
    });
    if (checkedValue.length > 0) {
      this.setData({
        tmpSpecText: checkedValue.join('　')
      });
    } else {
      this.setData({
        tmpSpecText: '请选择规格数量'
      });
    }

    if (this.isCheckedAllSpec()) {
      this.setData({
        checkedSpecText: this.data.tmpSpecText
      });

      // 规格所对应的货品选择以后
      let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
      if (!checkedProductArray || checkedProductArray.length <= 0) {
        this.setData({
          soldout: true
        });
        this.soldoutNotify();
        console.error('规格所对应货品不存在');
        return;
      }

      let checkedProduct = checkedProductArray[0];
      if (checkedProduct.number > 0) {
        this.setData({
          checkedSpecPrice: checkedProduct.price,
          soldout: false
        });
        this.notify.hide();
      } else {
        this.setData({
          checkedSpecPrice: this.data.goods.retailPrice,
          soldout: true
        });
        this.soldoutNotify();
      }

    } else {
      this.setData({
        checkedSpecText: '规格数量选择',
        checkedSpecPrice: this.data.goods.retailPrice,
        soldout: false
      });
      this.notify.hide();
    }

  },

  // 获取选中的产品（根据规格）
  getCheckedProductItem: function(key) {
    return this.data.productList.filter(function(v) {
      if (v.specifications.toString() == key.toString()) {
        return true;
      } else {
        return false;
      }
    });
  },

  //添加或是取消收藏
  addCollectOrNot: function() {
    let that = this;
    util.request(api.CollectAddOrDelete, {
        type: 0,
        valueId: this.data.id
      }, "POST")
      .then(function(res) {
        let _res = res;
        if (_res.errno == 0) {
          if (_res.data.status == 0) {
            that.setData({
              collectStatus: "收藏"
            });
          } else {
            that.setData({
              collectStatus: "已收藏"
            });
          }
        } else {
          wx.showToast({
            image: '/static/images/icon_error.png',
            title: _res.errmsg,
            mask: true
          });
        }
      });
  },
  //收藏状态
  getCollectStatus: function() {
    let that = this;
    util.request(api.CollectStatus, {
        type: 0,
        valueId: this.data.id
      }, "POST")
      .then(function(res) {
        let _res = res;
        if (_res.errno == 0) {
          if (_res.data.status == 0) {
            that.setData({
              collectStatus: "收藏"
            });
          } else {
            that.setData({
              collectStatus: "已收藏"
            });
          }
        } else {
          wx.showToast({
            image: '/static/images/icon_error.png',
            title: _res.errmsg,
            mask: true
          });
        }
      });
  },

  cutNumber: function() {
    this.setData({
      number: (this.data.number - 1 > 1) ? this.data.number - 1 : 1
    });
  },
  addNumber: function() {
    this.setData({
      number: this.data.number + 1
    });
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  switchAttrPop: function() {
    if (this.data.openAttr == false) {
      this.setData({
        openAttr: !this.data.openAttr
      });
    }
  },

  closeAttr: function() {
    this.setData({
      openAttr: false,
    });
  },
  openCartPage: function() {
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },
  //根据已选的值，计算其它值的状态
  setSpecValueStatus: function() {},
})