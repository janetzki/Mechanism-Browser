import io
import json
import pprint
import requests
from itertools import chain
from lxml import etree

pp = pprint.PrettyPrinter(indent=4)


class WebPageExtractor(object):
    def __init__(self, url):
        self.index_url = url
        self.index = dict()
        self.baseUrl = 'http://507movements.com/'

    @staticmethod
    def _depth(node):
        depth = 0
        while node is not None:
            depth += 1
            node = node.getparent()
        return depth

    def _parse_index(self):
        page = requests.get(self.index_url)
        root = etree.HTML(page.content)
        lists = root.xpath('//div[@class="toc"]/ul')
        for list in lists:
            mechanism_name = None
            attribute = None
            for element in list.iter():
                if element.text is not None:
                    text = element.text
                    if len(text) >= 2 and text[-2] == ',':
                        depth = WebPageExtractor._depth(element)
                        if depth == 10:
                            attribute = None
                            parts = text[:-2].split(',')
                            if len(parts) == 1:
                                mechanism_name = parts[0]
                            else:
                                assert len(parts) == 2
                                mechanism_name = parts[0].strip()
                                attribute = parts[1].strip()
                        else:
                            assert depth == 12
                            attribute = text[:-2]
                    elif element.text.isdigit():
                        id = int(element.text)
                        if attribute is None:
                            full_name = mechanism_name
                        else:
                            full_name = attribute[0].capitalize() + attribute[1:] + ' ' + mechanism_name.lower()
                        if self.index.get(id, None) is None:
                            self.index[id] = full_name
                        else:
                            self.index[id] += ' / ' + full_name
        pp.pprint(self.index)

    def _generate_url(self, id):
        if id == 262:
            return self.baseUrl + 'mm_262-263.html'
        return self.baseUrl + 'mm_{:03}.html'.format(id)

    def _parse_name_and_comments(self, text, id):
        name = 'Mechanism Request (generated from 507)'
        comments = ''
        separator = '. '
        parts = text.split(separator)
        if len(parts[1]) > 2 and len(parts[1].split(' ')) <= 2:
            name = parts[1]
            if len(parts) > 2:
                comments = separator.join(parts[2:]).strip()
        elif id in self.index:
            name = self.index[id]
            comments = separator.join(parts[1:]).strip()
        return name, comments

    @staticmethod
    def _stringify_children(node):
        # https://stackoverflow.com/a/4624146/8816968
        parts = ([node.text] +
                 list(chain(*([c.text, etree.tostring(c), c.tail] for c in node.getchildren()))) +
                 [node.tail])
        result = ''
        for part in parts:
            if isinstance(part, str):
                result += part
        return result

    def _extract_mechanism(self, id):
        url = self._generate_url(id)
        page = requests.get(url)
        tree = etree.HTML(page.content)
        mechanism = dict()
        mechanism['link'] = url
        text = WebPageExtractor._stringify_children(tree.xpath('//div[@class="main"]/p')[0])
        mechanism['name'], mechanism['comments'] = self._parse_name_and_comments(text, id)
        mechanism['image'] = self.baseUrl + tree.xpath('//img/@src')[0][1:]
        return mechanism

    def crawl_mechanisms(self):
        self._parse_index()
        mechanisms = []
        for id in range(1, 508):
            if id == 263:
                continue
            mechanism = self._extract_mechanism(id)
            print(id)
            pp.pprint(mechanism)
            mechanisms.append(mechanism)
        with io.open('507.json', 'w', encoding='utf8') as fout:
            json.dump(mechanisms, fout, indent=2, ensure_ascii=False)


if __name__ == '__main__':
    extractor = WebPageExtractor('http://507movements.com/toc.html')
    extractor.crawl_mechanisms()
