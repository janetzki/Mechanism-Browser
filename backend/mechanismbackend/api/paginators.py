from collections import OrderedDict
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param, remove_query_param


class FirstLastPageNumberPaginator(object):
    page_size = 10
    page_query_param = 'page'

    def paginate_list(self, l, request):
        self.request = request
        self.page_num = int(request.query_params.get(self.page_query_param, 1))
        self.count = len(l)  # number of mechanisms
        self.paged_list = self._chunk_list_to_pages(l)
        if len(self.paged_list) == 0:
            self.paged_list = [[]]
        requested_list = self.paged_list[self.page_num - 1]  # zero-based
        return requested_list

    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('current', self.page_num),
            ('count', self.count),
            ('first', self._get_first_link()),
            ('previous', self._get_previous_link()),
            ('next', self._get_next_link()),
            ('last', self._get_last_link()),
            ('results', data)
        ]))

    def _chunk_list_to_pages(self, l):
        return [l[i:i + self.page_size] for i in range(0, len(l), self.page_size)]

    def _get_first_link(self):
        url = self.request.build_absolute_uri()
        return replace_query_param(url, self.page_query_param, 1)

    def _get_last_link(self):
        url = self.request.build_absolute_uri()
        page_number = len(self.paged_list)
        return replace_query_param(url, self.page_query_param, page_number)

    def _get_previous_link(self):
        url = self.request.build_absolute_uri()
        if self.page_num == 1:
            return remove_query_param(url, self.page_query_param)
        return replace_query_param(url, self.page_query_param, self.page_num - 1)

    def _get_next_link(self):
        url = self.request.build_absolute_uri()
        if self.page_num == len(self.paged_list):
            return ''
        return replace_query_param(url, self.page_query_param, self.page_num + 1)




