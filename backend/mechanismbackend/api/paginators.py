from rest_framework import pagination
from collections import OrderedDict
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param, remove_query_param


class FirstLastPageNumberPaginator(pagination.PageNumberPagination):
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('current', self.page.number),
            ('count', self.page.paginator.count),
            ('first', self.get_first_link()),
            ('previous', self.get_previous_link()),
            ('next', self.get_next_link()),
            ('last', self.get_last_link()),
            ('results', data)
        ]))

    def get_first_link(self):
        url = self.request.build_absolute_uri()
        return replace_query_param(url, self.page_query_param, 1)

    def get_last_link(self):
        url = self.request.build_absolute_uri()
        page_number = self.page.paginator.num_pages
        return replace_query_param(url, self.page_query_param, page_number)


class MyFirstLastPageNumberPaginator(object):
    page_size = 10
    page_query_param = 'page'

    def paginate_list(self, l, request):
        self.request = request
        self.page_num = int(request.query_params.get(self.page_query_param, 1))
        self.count = len(l)  # number of mechanisms
        self.paged_list = self.chunks(l, self.page_size)
        if len(self.paged_list) == 0:
            self.paged_list = [[]]
        requested_list = self.paged_list[self.page_num - 1]  # zero-based
        return requested_list

    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('current', self.page_num),
            ('count', self.count),
            ('first', self.get_first_link()),
            ('previous', self.get_previous_link()),
            ('next', self.get_next_link()),
            ('last', self.get_last_link()),
            ('results', data)
        ]))

    def chunks(self, l, n):
        return [l[i:i + n] for i in range(0, len(l), n)]

    def get_first_link(self):
        url = self.request.build_absolute_uri()
        return replace_query_param(url, self.page_query_param, 1)

    def get_last_link(self):
        url = self.request.build_absolute_uri()
        page_number = len(self.paged_list)
        return replace_query_param(url, self.page_query_param, page_number)

    def get_previous_link(self):
        url = self.request.build_absolute_uri()
        if self.page_num == 1:
            return remove_query_param(url, self.page_query_param)
        return replace_query_param(url, self.page_query_param, self.page_num - 1)

    def get_next_link(self):
        url = self.request.build_absolute_uri()
        if self.page_num == len(self.paged_list):
            return ''
        return replace_query_param(url, self.page_query_param, self.page_num + 1)




