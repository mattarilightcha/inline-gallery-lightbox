<?php
/**
 * Plugin Name: Inline Gallery Lightbox
 * Description: 画像ギャラリーとライトボックス機能だけを抽出した軽量プラグイン。ブロックエディターから画像/YouTubeを選び、フロントでライトボックス再生が可能。
 * Version: 1.0.0
 * Author: You
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL-2.0+
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define('IGL_VER', '1.0.0');
define('IGL_URL', plugin_dir_url(__FILE__));
define('IGL_PATH', plugin_dir_path(__FILE__));

add_action('init', function () {
    // Front styles & scripts
    wp_register_style('igl-frontend-css', IGL_URL . 'assets/css/frontend.css', [], IGL_VER);
    wp_register_script('igl-frontend-js', IGL_URL . 'assets/js/frontend.js', [], IGL_VER, true);

    // Editor styles & scripts
    wp_register_style('igl-editor-css', IGL_URL . 'assets/css/editor.css', ['wp-edit-blocks'], IGL_VER);
    wp_register_script(
        'igl-editor-js',
        IGL_URL . 'assets/js/editor.js',
        ['wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-data'],
        IGL_VER,
        true
    );

    register_block_type('igl/gallery', [
        'api_version'   => 2,
        'editor_script' => 'igl-editor-js',
        'editor_style'  => 'igl-editor-css',
        'style'         => 'igl-frontend-css',
        'script'        => 'igl-frontend-js',
        'render_callback' => 'igl_render_gallery_block',
        'attributes' => [
            'items' => [
                'type' => 'array',
                'default' => [],
            ],
            'columns' => [
                'type' => 'number',
                'default' => 4,
            ],
            'gap' => [
                'type' => 'number',
                'default' => 10,
            ],
            'maxInitial' => [
                'type' => 'number',
                'default' => 8,
            ],
        ],
    ]);
});

/**
 * Render Callback
 */
function igl_render_gallery_block( $attributes, $content, $block ) {
    $items      = isset($attributes['items']) ? $attributes['items'] : [];
    $columns    = max(1, intval($attributes['columns'] ?? 4));
    $gap        = max(0, intval($attributes['gap'] ?? 10));
    $maxInitial = min(10, max(0, intval($attributes['maxInitial'] ?? 8)));

    if (empty($items)) {
        return '<div class="igl-empty">画像や動画が未設定です。</div>';
    }

    $gridStyle = sprintf('grid-template-columns: repeat(%d, 1fr); gap:%dpx;', $columns, $gap);

    $first = array_slice($items, 0, $maxInitial);
    $rest  = array_slice($items, $maxInitial);

    ob_start(); ?>
<div class="game-mod-block igl-block">
  <div class="game-mod-images" style="<?php echo esc_attr($gridStyle); ?>">
    <?php foreach ($first as $index => $item): ?>
      <?php echo igl_render_item($item, $index); ?>
    <?php endforeach; ?>
  </div>

  <?php if (!empty($rest)): ?>
    <div class="game-mod-images-more" style="<?php echo esc_attr($gridStyle); ?>">
      <?php foreach ($rest as $i => $item): ?>
        <?php echo igl_render_item($item, $maxInitial + $i); ?>
      <?php endforeach; ?>
    </div>
    <button type="button" class="game-mod-show-more">続き (<?php echo intval(count($rest)); ?>)</button>
  <?php endif; ?>
</div>
<?php
    return ob_get_clean();
}

function igl_render_item($item, $index) {
    $type = $item['type'] ?? 'image';
    if ($type === 'youtube') {
        $videoId   = esc_attr($item['videoId'] ?? '');
        $thumbnail = esc_url($item['thumbnail'] ?? '');
        $html  = '<div class="game-mod-video" data-video-id="' . $videoId . '" data-thumbnail="' . $thumbnail . '" data-index="' . intval($index) . '">';
        $html .= '  <div class="game-mod-video-thumbnail" style="background-image:url(' . $thumbnail . ');"></div>';
        $html .= '  <div class="play-button" aria-hidden="true"></div>';
        $html .= '</div>';
        return $html;
    } else {
        $url = esc_url($item['url'] ?? '');
        $alt = esc_attr($item['alt'] ?? '');
        $html  = '<a href="' . $url . '" class="game-mod-image-link" data-index="' . intval($index) . '">';
        $html .= '  <div class="game-mod-image"><img class="game-mod-thumbnail" src="' . $url . '" alt="' . $alt . '"></div>';
        $html .= '</a>';
        return $html;
    }
}
