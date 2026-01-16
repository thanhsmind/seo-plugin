import type { SeoRule } from '../types';
import { normalize, wordCount } from '../../text';
import { keywordInText, keywordAtBeginning } from '../../keywords';

export const basicRules: SeoRule[] = [
	{
		id: 'keyword-in-title',
		group: 'basic',
		name: 'Từ khóa trong Tiêu đề SEO',
		description: 'Kiểm tra từ khóa chính có xuất hiện trong tiêu đề SEO',
		check: (context) => {
			const { title, focusKeyphrase } = context;
			if (!focusKeyphrase || !title) {
				return { pass: false, data: { found: false, atBeginning: false } };
			}
			const found = keywordInText(title, focusKeyphrase);
			const atBeginning = keywordAtBeginning(title, focusKeyphrase);
			return { pass: found, data: { found, atBeginning } };
		},
		messages: {
			pass: (data) =>
				data.atBeginning
					? 'Từ khóa xuất hiện ở đầu tiêu đề SEO. Tuyệt vời!'
					: 'Từ khóa xuất hiện trong tiêu đề SEO.',
			fail: 'Từ khóa chưa xuất hiện trong tiêu đề SEO. Hãy thêm từ khóa vào tiêu đề.',
		},
	},
	{
		id: 'keyword-in-description',
		group: 'basic',
		name: 'Từ khóa trong Mô tả Meta',
		description: 'Kiểm tra từ khóa chính có xuất hiện trong mô tả meta',
		check: (context) => {
			const { metaDescription, focusKeyphrase } = context;
			if (!focusKeyphrase || !metaDescription) {
				return { pass: false };
			}
			const found = keywordInText(metaDescription, focusKeyphrase);
			return { pass: found };
		},
		messages: {
			pass: 'Từ khóa xuất hiện trong mô tả meta.',
			fail: 'Từ khóa chưa xuất hiện trong mô tả meta. Hãy thêm từ khóa vào mô tả.',
		},
	},
	{
		id: 'keyword-in-url',
		group: 'basic',
		name: 'Từ khóa trong URL',
		description: 'Kiểm tra từ khóa chính có xuất hiện trong URL/slug',
		check: (context) => {
			const { slug, url, focusKeyphrase } = context;
			const targetUrl = slug || url || '';
			if (!focusKeyphrase || !targetUrl) {
				return { pass: false };
			}
			const normalizedUrl = normalize(targetUrl);
			const normalizedKeyword = normalize(focusKeyphrase);
			const found = normalizedUrl.includes(normalizedKeyword);
			return { pass: found };
		},
		messages: {
			pass: 'Từ khóa xuất hiện trong URL.',
			fail: 'Từ khóa chưa xuất hiện trong URL. Hãy thêm từ khóa vào slug.',
		},
	},
	{
		id: 'keyword-in-first-10-percent',
		group: 'basic',
		name: 'Từ khóa trong 10% đầu nội dung',
		description: 'Kiểm tra từ khóa chính có xuất hiện trong 10% đầu nội dung',
		check: (context) => {
			const { content, focusKeyphrase } = context;
			if (!focusKeyphrase || !content) {
				return { pass: false };
			}
			const words = content.trim().split(/\s+/).filter((w) => w.length > 0);
			const first10PercentCount = Math.ceil(words.length * 0.1);
			const first10Percent = words.slice(0, first10PercentCount).join(' ');
			const found = keywordInText(first10Percent, focusKeyphrase);
			return { pass: found };
		},
		messages: {
			pass: 'Từ khóa xuất hiện trong 10% đầu nội dung.',
			fail: 'Từ khóa chưa xuất hiện trong 10% đầu nội dung. Hãy đề cập từ khóa sớm hơn trong bài viết.',
		},
	},
	{
		id: 'content-length',
		group: 'basic',
		name: 'Độ dài nội dung',
		description: 'Kiểm tra nội dung có đủ độ dài tối thiểu',
		check: (context) => {
			const { content } = context;
			const count = wordCount(content || '');
			if (count >= 600) {
				return { pass: true, data: { wordCount: count, status: 'pass' } };
			}
			if (count >= 300) {
				return { pass: true, data: { wordCount: count, status: 'warning' } };
			}
			return { pass: false, data: { wordCount: count, status: 'fail' } };
		},
		messages: {
			pass: (data) => `Nội dung có ${data.wordCount} từ. Độ dài tốt!`,
			warning: (data) =>
				`Nội dung có ${data.wordCount} từ. Nên viết thêm để đạt ít nhất 600 từ.`,
			fail: (data) =>
				`Nội dung chỉ có ${data.wordCount} từ. Cần ít nhất 300 từ.`,
		},
	},
];
