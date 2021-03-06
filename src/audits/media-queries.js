/**
 * External dependencies
 */
const csstree = require( 'css-tree' );

/**
 * Internal dependencies
 */
const getValuesCount = require( '../utils/get-values-count' );

module.exports = function ( files = [] ) {
	const allQueries = [];
	const allSizes = [];
	const nonWidthQueries = [];
	files.forEach( ( { content } ) => {
		const ast = csstree.parse( content );
		csstree.walk( ast, {
			visit: 'MediaQuery',
			enter( node ) {
				if ( node.children ) {
					allQueries.push( csstree.generate( node ) );
				}
				csstree.walk( node, {
					visit: 'MediaFeature',
					enter( sizeNode ) {
						if (
							sizeNode.name === 'max-width' ||
							sizeNode.name === 'min-width'
						) {
							if (
								sizeNode.value &&
								sizeNode.value.type === 'Dimension'
							) {
								allSizes.push(
									csstree.generate( sizeNode.value )
								);
							}
						} else {
							nonWidthQueries.push(
								csstree.generate( sizeNode )
							);
						}
					},
				} );
			},
		} );
	} );

	const uniqQueries = [ ...new Set( allQueries ) ];
	const uniqSizes = [ ...new Set( allSizes ) ];
	const queriesByCount = getValuesCount( allQueries );
	const sizesByCount = getValuesCount( allSizes );
	const nonWidthByCount = getValuesCount( nonWidthQueries );

	return {
		audit: 'media-queries',
		name: 'Media Queries',
		results: [
			{
				id: 'count',
				label: 'Number of total media queries',
				value: allQueries.length,
			},
			{
				id: 'count-unique-queries',
				label: 'Number of seemingly-unique media queries',
				value: uniqQueries.length,
			},
			{
				id: 'top-10-queries',
				label: 'Top 10 most-used media queries',
				value: queriesByCount.slice( 0, 10 ),
			},
			{
				id: 'count-unique-sizes',
				label: 'Number of unique breakpoint sizes',
				value: uniqSizes.length,
			},
			{
				id: 'top-10-sizes',
				label: 'Top 10 most-used breakpoint sizes',
				value: sizesByCount.slice( 0, 10 ),
			},
			{
				id: 'bottom-10-sizes',
				label: 'Top 10 least-used breakpoint sizes',
				value: sizesByCount.slice( -10 ).reverse(),
			},
			{
				id: 'non-width',
				label: 'Non-width related media queries',
				value: nonWidthByCount,
			},
		],
	};
};
