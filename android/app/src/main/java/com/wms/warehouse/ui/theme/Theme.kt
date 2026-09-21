package com.wms.warehouse.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = BluePrimary,
    onPrimary = TextPrimary,
    secondary = EmeraldB2,
    onSecondary = TextPrimary,
    tertiary = AmberIssue,
    background = DarkSlate950,
    surface = DarkSlate900,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    surfaceVariant = DarkSlate800,
    onSurfaceVariant = TextSecondary,
    outline = DarkSlate700
)

@Composable
fun WmsTheme(
    darkTheme: Boolean = true, // Industrial dark mode default
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
