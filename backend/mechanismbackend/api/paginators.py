from rest_framework import pagination
from collections import OrderedDict
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param


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