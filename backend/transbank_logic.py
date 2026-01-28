from transbank.webpay.webpay_plus.transaction import Transaction as WebpayPlusTransaction
from transbank.common.options import WebpayOptions
from transbank.common.integration_commerce_codes import IntegrationCommerceCodes
from transbank.common.integration_api_keys import IntegrationApiKeys
from transbank.common.integration_type import IntegrationType
import os

class TransbankService:
    @staticmethod
    def get_webpay_plus():
        options = WebpayOptions(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, IntegrationType.TEST)
        tx = WebpayPlusTransaction(options)
        return tx

    @classmethod
    def start_webpay_plus(cls, buy_order, session_id, amount, return_url):
        tx = cls.get_webpay_plus()
        res = tx.create(buy_order, session_id, amount, return_url)
        return {"url": res['url'], "token": res['token']}

    @classmethod
    def commit_webpay_plus(cls, token):
        tx = cls.get_webpay_plus()
        res = tx.commit(token)
        return {
            "status": res.get('status'),
            "buy_order": res.get('buy_order'),
            "amount": res.get('amount'),
            "vci": res.get('vci'),
            "response_code": res.get('response_code')
        }
